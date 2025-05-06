module medrec_addr::Relationship {
    use std::signer;
    use std::vector;
    use aptos_std::table::{Table, Self};
    use aptos_framework::event;
    use aptos_framework::account;
    use medrec_addr::Agent;
    use std::bcs;

    struct Relationship has store {
        provider: address,
        viewers: vector<address>,
        is_active: bool
    }

    struct Relationships has key {
        relationships: Table<address, Relationship>,
        relationship_events: event::EventHandle<RelationshipEvent>
    }

    struct RelationshipEvent has store, drop {
        patient: address,
        provider: address,
        event_type: u8, // 0 = created, 1 = viewer_added, 2 = viewer_removed, 3 = status_changed
        data: vector<u8>
    }

    // Error codes
    const ERELATIONSHIP_EXISTS: u64 = 1;
    const ENOT_PROVIDER: u64 = 2;
    const ERELATIONSHIP_NOT_FOUND: u64 = 3;
    const EVIEWER_EXISTS: u64 = 4;
    const EINACTIVE_RELATIONSHIP: u64 = 5;

    public fun create_relationship(account: &signer, provider: address) acquires Relationships {
        let patron = signer::address_of(account);
        
        // Verify provider is actually a provider
        assert!(Agent::get_agent_type(provider) == 1, ENOT_PROVIDER);
        
        if (!exists<Relationships>(patron)) {
            move_to(account, Relationships {
                relationships: table::new(),
                relationship_events: account::new_event_handle<RelationshipEvent>(account)
            });
        };
        
        let relationships = borrow_global_mut<Relationships>(patron);
        assert!(!table::contains(&relationships.relationships, provider), ERELATIONSHIP_EXISTS);
        
        table::add(&mut relationships.relationships, provider, Relationship {
            provider,
            viewers: vector::empty(),
            is_active: true
        });

        event::emit_event(&mut relationships.relationship_events, RelationshipEvent {
            patient: patron,
            provider,
            event_type: 0,
            data: vector::empty()
        });
    }

    public entry fun add_viewer(account: &signer, provider: address, viewer: address) acquires Relationships {
        let patron = signer::address_of(account);
        let relationships = borrow_global_mut<Relationships>(patron);
        assert!(table::contains(&relationships.relationships, provider), ERELATIONSHIP_NOT_FOUND);
        
        let relationship = table::borrow_mut(&mut relationships.relationships, provider);
        assert!(relationship.is_active, EINACTIVE_RELATIONSHIP);
        assert!(!vector::contains(&relationship.viewers, &viewer), EVIEWER_EXISTS);
        
        vector::push_back(&mut relationship.viewers, viewer);
        
        event::emit_event(&mut relationships.relationship_events, RelationshipEvent {
            patient: patron,
            provider,
            event_type: 1,
            data: to_bytes(&viewer)
        });
    }

    public entry fun remove_viewer(account: &signer, provider: address, viewer: address) acquires Relationships {
        let patron = signer::address_of(account);
        let relationships = borrow_global_mut<Relationships>(patron);
        let relationship = table::borrow_mut(&mut relationships.relationships, provider);
        
        let (found, index) = vector::index_of(&relationship.viewers, &viewer);
        if (found) {
            vector::remove(&mut relationship.viewers, index);
            event::emit_event(&mut relationships.relationship_events, RelationshipEvent {
                patient: patron,
                provider,
                event_type: 2,
                data: to_bytes(&viewer)
            });
        };
    }

    public entry fun set_relationship_status(
        account: &signer,
        provider: address,
        is_active: bool
    ) acquires Relationships {
        let patron = signer::address_of(account);
        let relationships = borrow_global_mut<Relationships>(patron);
        let relationship = table::borrow_mut(&mut relationships.relationships, provider);
        relationship.is_active = is_active;
        
        event::emit_event(&mut relationships.relationship_events, RelationshipEvent {
            patient: patron,
            provider,
            event_type: 3,
            data: vector::singleton(if (is_active) 1u8 else 0u8)
        });
    }

    public fun get_viewers(patron: address, provider: address): vector<address> acquires Relationships {
        let relationships = &borrow_global<Relationships>(patron).relationships;
        let relationship = table::borrow(relationships, provider);
        relationship.viewers
    }

    public fun has_access(patron: address, provider: address, viewer: address): bool acquires Relationships {
        if (!exists<Relationships>(patron)) {
            return false
        };
        let relationships = &borrow_global<Relationships>(patron).relationships;
        if (!table::contains(relationships, provider)) {
            return false
        };
        
        let relationship = table::borrow(relationships, provider);
        relationship.is_active && vector::contains(&relationship.viewers, &viewer)
    }

    fun to_bytes(addr: &address): vector<u8> {
        let bytes = vector::empty<u8>();
        let addr_bytes = bcs::to_bytes(addr);
        vector::append(&mut bytes, addr_bytes);
        bytes
    }

    #[test_only]
    use std::string;

    #[test(patron = @0x1, provider = @0x2)]
    public entry fun test_relationship_creation(patron: signer, provider: signer) acquires Relationships {
        let patron_addr = signer::address_of(&patron);
        let provider_addr = signer::address_of(&provider);

        create_relationship(&patron, provider_addr);
        let viewers = get_viewers(patron_addr, provider_addr);
        assert!(vector::length(&viewers) == 0, 1);
    }

    #[test(patron = @0x1, provider = @0x2, viewer = @0x3)]
    public entry fun test_add_viewer(
        patron: signer, 
        provider: signer, 
        viewer: signer
    ) acquires Relationships {
        let patron_addr = signer::address_of(&patron);
        let provider_addr = signer::address_of(&provider);
        let viewer_addr = signer::address_of(&viewer);

        create_relationship(&patron, provider_addr);
        add_viewer(&patron, provider_addr, viewer_addr);

        let viewers = get_viewers(patron_addr, provider_addr);
        assert!(vector::length(&viewers) == 1, 1);
        assert!(*vector::borrow(&viewers, 0) == viewer_addr, 2);

        assert!(has_access(patron_addr, provider_addr, viewer_addr), 3);
    }
}