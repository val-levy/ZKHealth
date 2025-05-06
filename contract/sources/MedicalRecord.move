module medrec_addr::MedicalRecord {
    use std::signer;
    use aptos_std::table::{Self, Table};
    use medrec_addr::Relationship;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::account;
    use medrec_addr::Agent;

    struct Record has store, copy {
        id: u64,
        patient: address,
        provider: address,
        data_hash: vector<u8>,
        timestamp: u64,
        record_type: u8,
        is_active: bool
    }

    struct PatientRecords has key {
        records: Table<u64, Record>,
        record_counter: u64,
        record_events: event::EventHandle<RecordEvent>
    }

    struct RecordEvent has store, drop {
        record_id: u64,
        patient: address,
        provider: address,
        event_type: u8, // 0 = created, 1 = updated, 2 = status_changed
        timestamp: u64
    }

    // Error codes
    const ENO_RECORDS: u64 = 1;
    const ERECORD_NOT_FOUND: u64 = 2;
    const EUNAUTHORIZED: u64 = 3;
    const EINACTIVE_RECORD: u64 = 4;
    const ENOT_PROVIDER: u64 = 5;

    // Record types
    const RECORD_TYPE_GENERAL: u8 = 0;
    const RECORD_TYPE_LAB: u8 = 1;
    const RECORD_TYPE_PRESCRIPTION: u8 = 2;
    const RECORD_TYPE_IMAGING: u8 = 3;

    public entry fun create_records_storage(account: &signer) {
        let addr = signer::address_of(account);
        if (!exists<PatientRecords>(addr)) {
            move_to(account, PatientRecords {
                records: table::new(),
                record_counter: 0,
                record_events: account::new_event_handle<RecordEvent>(account)
            });
        }
    }

    public entry fun add_record(
        provider: &signer,
        patient: address,
        data_hash: vector<u8>,
        record_type: u8
    ) acquires PatientRecords {
        let provider_addr = signer::address_of(provider);
        
        // Verify provider is actually a provider
        assert!(Agent::get_agent_type(provider_addr) == 1, ENOT_PROVIDER);
        
        // Verify relationship exists with enhanced access check
        assert!(
            Relationship::has_access(patient, provider_addr, provider_addr),
            EUNAUTHORIZED
        );
        
        assert!(exists<PatientRecords>(patient), ENO_RECORDS);
        
        let patient_records = borrow_global_mut<PatientRecords>(patient);
        let record_id = patient_records.record_counter + 1;
        
        table::add(&mut patient_records.records, record_id, Record {
            id: record_id,
            patient,
            provider: provider_addr,
            data_hash,
            timestamp: timestamp::now_microseconds(),
            record_type,
            is_active: true
        });
        
        event::emit_event(&mut patient_records.record_events, RecordEvent {
            record_id,
            patient,
            provider: provider_addr,
            event_type: 0,
            timestamp: timestamp::now_microseconds()
        });
        
        patient_records.record_counter = record_id;
    }

    public entry fun update_record_status(
        provider: &signer,
        patient: address,
        record_id: u64,
        is_active: bool
    ) acquires PatientRecords {
        let provider_addr = signer::address_of(provider);
        assert!(
            Relationship::has_access(patient, provider_addr, provider_addr),
            EUNAUTHORIZED
        );
        
        let patient_records = borrow_global_mut<PatientRecords>(patient);
        assert!(table::contains(&patient_records.records, record_id), ERECORD_NOT_FOUND);
        
        let record = table::borrow_mut(&mut patient_records.records, record_id);
        record.is_active = is_active;
        
        event::emit_event(&mut patient_records.record_events, RecordEvent {
            record_id,
            patient,
            provider: provider_addr,
            event_type: 2,
            timestamp: timestamp::now_microseconds()
        });
    }

    public fun get_record(
        requester: address,
        patient: address,
        record_id: u64
    ): Record acquires PatientRecords {
        let patient_records = borrow_global<PatientRecords>(patient);
        assert!(table::contains(&patient_records.records, record_id), ERECORD_NOT_FOUND);
        
        let record = table::borrow(&patient_records.records, record_id);
        assert!(record.is_active, EINACTIVE_RECORD);
        
        // Check access permission
        assert!(
            Relationship::has_access(patient, record.provider, requester),
            EUNAUTHORIZED
        );

        *record
    }

    public fun get_record_type(record: &Record): u8 {
        record.record_type
    }

    public fun get_record_timestamp(record: &Record): u64 {
        record.timestamp
    }

    #[test(patient = @0x1, provider = @0x2)]
    public entry fun test_record_creation_and_access(
        patient: signer,
        provider: signer
    ) acquires PatientRecords {
        use std::vector;
        
        let patient_addr = signer::address_of(&patient);
        let provider_addr = signer::address_of(&provider);
        let data_hash = vector::empty();
        vector::append(&mut data_hash, b"test_hash");

        // Setup patient records
        create_records_storage(&patient);
        
        // Setup relationship
        Relationship::create_relationship(&patient, provider_addr);
        Relationship::add_viewer(&patient, provider_addr, provider_addr);

        // Add record
        add_record(&provider, patient_addr, data_hash, RECORD_TYPE_GENERAL);
        
        // Verify record
        let record = get_record(provider_addr, patient_addr, 1);
        assert!(record.id == 1, 1);
        assert!(record.patient == patient_addr, 2);
        assert!(record.provider == provider_addr, 3);
        assert!(record.data_hash == data_hash, 4);
        assert!(record.record_type == RECORD_TYPE_GENERAL, 5);
    }

    #[test(patient = @0x1, provider = @0x2, unauthorized = @0x3)]
    #[expected_failure(abort_code = 3)]
    public entry fun test_unauthorized_access(
        patient: signer,
        provider: signer,
        unauthorized: signer
    ) acquires PatientRecords {
        use std::vector;
        
        let patient_addr = signer::address_of(&patient);
        let provider_addr = signer::address_of(&provider);
        let unauthorized_addr = signer::address_of(&unauthorized);
        let data_hash = vector::empty();
        vector::append(&mut data_hash, b"test_hash");

        // Setup patient records
        create_records_storage(&patient);
        
        // Setup relationship
        Relationship::create_relationship(&patient, provider_addr);
        Relationship::add_viewer(&patient, provider_addr, provider_addr);

        // Add record
        add_record(&provider, patient_addr, data_hash, RECORD_TYPE_GENERAL);
        
        // Try to access record with unauthorized account (should fail)
        get_record(unauthorized_addr, patient_addr, 1);
    }
}