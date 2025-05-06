module medrec_addr::Agent {
    use std::signer;
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::account;
    use std::bcs;

    struct Agent has key {
        owner: address,
        custodians: vector<address>,
        is_active: bool,
        agent_type: u8, // 0 = patient, 1 = provider
        agent_events: event::EventHandle<AgentEvent>
    }

    struct AgentEvent has store, drop {
        agent_address: address,
        event_type: u8, // 0 = created, 1 = custodian_added, 2 = custodian_removed, 3 = status_changed
        data: vector<u8>
    }

    // Error codes
    const EAGENT_EXISTS: u64 = 1;
    const EAGENT_DOES_NOT_EXIST: u64 = 2;
    const EINVALID_AGENT_TYPE: u64 = 3;
    const ECUSTODIAN_ALREADY_EXISTS: u64 = 4;

    // Constants
    const AGENT_TYPE_PATIENT: u8 = 0;
    const AGENT_TYPE_PROVIDER: u8 = 1;

    public entry fun create_agent(account: &signer, agent_type: u8) acquires Agent {
        let owner = signer::address_of(account);
        assert!(!exists<Agent>(owner), EAGENT_EXISTS);
        assert!(agent_type <= 1, EINVALID_AGENT_TYPE);
        
        move_to(account, Agent {
            owner,
            custodians: vector::empty(),
            is_active: true,
            agent_type,
            agent_events: account::new_event_handle<AgentEvent>(account)
        });

        event::emit_event(&mut borrow_global_mut<Agent>(owner).agent_events, AgentEvent {
            agent_address: owner,
            event_type: 0,
            data: vector::empty()
        });
    }

    public entry fun add_custodian(account: &signer, custodian: address) acquires Agent {
        let owner = signer::address_of(account);
        assert!(exists<Agent>(owner), EAGENT_DOES_NOT_EXIST);
        
        let agent = borrow_global_mut<Agent>(owner);
        assert!(!vector::contains(&agent.custodians, &custodian), ECUSTODIAN_ALREADY_EXISTS);
        
        vector::push_back(&mut agent.custodians, custodian);
        event::emit_event(&mut agent.agent_events, AgentEvent {
            agent_address: owner,
            event_type: 1,
            data: to_bytes(&custodian)
        });
    }

    public entry fun remove_custodian(account: &signer, custodian: address) acquires Agent {
        let owner = signer::address_of(account);
        let agent = borrow_global_mut<Agent>(owner);
        let (found, index) = vector::index_of(&agent.custodians, &custodian);
        if (found) {
            vector::remove(&mut agent.custodians, index);
            event::emit_event(&mut agent.agent_events, AgentEvent {
                agent_address: owner,
                event_type: 2,
                data: to_bytes(&custodian)
            });
        }
    }

    public entry fun set_active_status(account: &signer, is_active: bool) acquires Agent {
        let owner = signer::address_of(account);
        let agent = borrow_global_mut<Agent>(owner);
        agent.is_active = is_active;
        event::emit_event(&mut agent.agent_events, AgentEvent {
            agent_address: owner,
            event_type: 3,
            data: vector::singleton(if (is_active) 1u8 else 0u8)
        });
    }

    public fun get_custodians(owner: address): vector<address> acquires Agent {
        borrow_global<Agent>(owner).custodians
    }

    public fun is_active(owner: address): bool acquires Agent {
        borrow_global<Agent>(owner).is_active
    }

    public fun get_agent_type(owner: address): u8 acquires Agent {
        borrow_global<Agent>(owner).agent_type
    }

    fun to_bytes(addr: &address): vector<u8> {
        let bytes = vector::empty<u8>();
        let addr_bytes = bcs::to_bytes(addr);
        vector::append(&mut bytes, addr_bytes);
        bytes
    }

    #[test(account = @0x1)]
    public entry fun test_agent_creation(account: signer) acquires Agent {
        let addr = signer::address_of(&account);
        
        // Create new agent
        create_agent(&account, AGENT_TYPE_PATIENT);
        assert!(exists<Agent>(addr), 0);
        
        // Check empty custodians
        let custodians = get_custodians(addr);
        assert!(vector::length(&custodians) == 0, 1);
    }

    #[test(account = @0x1)]
    public entry fun test_add_custodian(account: signer) acquires Agent {
        let addr = signer::address_of(&account);
        let custodian_addr = @0x2;
        
        // Create new agent
        create_agent(&account, AGENT_TYPE_PATIENT);
        
        // Add custodian
        add_custodian(&account, custodian_addr);
        
        // Verify custodian was added
        let custodians = get_custodians(addr);
        assert!(vector::length(&custodians) == 1, 1);
        assert!(*vector::borrow(&custodians, 0) == custodian_addr, 2);
    }

    #[test(account = @0x1)]
    #[expected_failure]
    public entry fun test_duplicate_agent_creation(account: signer) {
        // Create agent twice should fail
        create_agent(&account, AGENT_TYPE_PATIENT);
        create_agent(&account, AGENT_TYPE_PATIENT);
    }
}