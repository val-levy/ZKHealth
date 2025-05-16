#![no_std]

use soroban_sdk::{
    contract, contractimpl, symbol_short, Env, Address, BytesN, Vec,
};

#[contract]
pub struct RelationshipContract;

#[contractimpl]
impl RelationshipContract {
    /// Establish a patient ↔ provider relationship
    pub fn register_relationship(env: Env, patient: Address, provider: Address) {
        let key = (symbol_short!("REL"), patient.clone(), provider.clone());
        env.storage().instance().set(&key, &true);
        
        // Also maintain an index of all providers for each patient
        let patient_providers_key = (symbol_short!("PPIDX"), patient.clone());
        let mut providers: Vec<Address> = env.storage()
            .instance()
            .get(&patient_providers_key)
            .unwrap_or(Vec::new(&env));
            
        if !providers.contains(&provider) {
            providers.push_back(provider.clone());
            env.storage().instance().set(&patient_providers_key, &providers);
        }
        
        // Also maintain an index of all patients for each provider
        let provider_patients_key = (symbol_short!("PRIDX"), provider.clone());
        let mut patients: Vec<Address> = env.storage()
            .instance()
            .get(&provider_patients_key)
            .unwrap_or(Vec::new(&env));
            
        if !patients.contains(&patient) {
            patients.push_back(patient.clone());
            env.storage().instance().set(&provider_patients_key, &patients);
        }
    }

    /// Add a record pointer under an existing relationship and index it
    pub fn add_record(
        env: Env,
        patient: Address,
        provider: Address,
        record_hash: BytesN<32>,
    ) {
        // Ensure relationship exists
        let rel_key = (symbol_short!("REL"), patient.clone(), provider.clone());
        let has_rel: Option<bool> = env.storage().instance().get(&rel_key);
        if has_rel != Some(true) {
            panic!("No relationship established");
        }
        // Store the record pointer
        let rec_key = (
            symbol_short!("REC"),
            patient.clone(),
            provider.clone(),
            record_hash.clone(),
        );
        env.storage().instance().set(&rec_key, &true);

        // Maintain an on-chain index for listing
        let idx_key = (symbol_short!("IDX"), patient.clone(), provider.clone());
        let mut idx: Vec<BytesN<32>> = env.storage()
            .instance()
            .get(&idx_key)
            .unwrap_or(Vec::new(&env));
        // Only push if not already present
        let mut present = false;
        let len = idx.len();
        for i in 0..len {
            if idx.get(i).unwrap() == record_hash.clone() {
                present = true;
                break;
            }
        }
        if !present {
            idx.push_back(record_hash.clone());
            env.storage().instance().set(&idx_key, &idx);
        }
    }

    /// Check if a provider has access to a specific record
    pub fn has_access(
        env: Env,
        patient: Address,
        provider: Address,
        record_hash: BytesN<32>,
    ) -> bool {
        let rec_key = (symbol_short!("REC"), patient, provider, record_hash);
        env.storage().instance().get(&rec_key).unwrap_or(false)
    }

    /// List all record_hashes for a patient ↔ provider relationship
    pub fn list_records(
        env: Env,
        patient: Address,
        provider: Address,
    ) -> Vec<BytesN<32>> {
        let idx_key = (symbol_short!("IDX"), patient, provider);
        env.storage()
            .instance()
            .get(&idx_key)
            .unwrap_or(Vec::new(&env))
    }
    
    /// List all providers associated with a patient
    pub fn list_patient_providers(env: Env, patient: Address) -> Vec<Address> {
        let patient_providers_key = (symbol_short!("PPIDX"), patient);
        env.storage()
            .instance()
            .get(&patient_providers_key)
            .unwrap_or(Vec::new(&env))
    }
    
    /// List all patients associated with a provider
    pub fn list_provider_patients(env: Env, provider: Address) -> Vec<Address> {
        let provider_patients_key = (symbol_short!("PRIDX"), provider);
        env.storage()
            .instance()
            .get(&provider_patients_key)
            .unwrap_or(Vec::new(&env))
    }
    
    /// List all related agents (either providers or patients) for a given agent
    pub fn list_related_agents(env: Env, agent: Address) -> Vec<Address> {
        // First check if the agent has any providers
        let providers = Self::list_patient_providers(env.clone(), agent.clone());
        
        // Then check if the agent has any patients
        let patients = Self::list_provider_patients(env.clone(), agent.clone());
        
        // Combine the two lists into one comprehensive list
        let mut all_related = Vec::new(&env);
        
        // Add all providers
        for i in 0..providers.len() {
            all_related.push_back(providers.get(i).unwrap());
        }
        
        // Add all patients
        for i in 0..patients.len() {
            all_related.push_back(patients.get(i).unwrap());
        }
        
        all_related
    }
    
    /// Check if two agents have a relationship (in either direction)
    pub fn has_relationship(env: Env, agent1: Address, agent2: Address) -> bool {
        let key1 = (symbol_short!("REL"), agent1.clone(), agent2.clone());
        let key2 = (symbol_short!("REL"), agent2.clone(), agent1.clone());
        
        let has_rel1: Option<bool> = env.storage().instance().get(&key1);
        let has_rel2: Option<bool> = env.storage().instance().get(&key2);
        
        has_rel1 == Some(true) || has_rel2 == Some(true)
    }
    
    /// Remove a relationship between a patient and provider
    pub fn remove_relationship(env: Env, patient: Address, provider: Address) {
        // Remove the main relationship marker
        let rel_key = (symbol_short!("REL"), patient.clone(), provider.clone());
        env.storage().instance().remove(&rel_key);
        
        // Remove provider from patient's provider list
        let patient_providers_key = (symbol_short!("PPIDX"), patient.clone());
        let providers: Vec<Address> = env.storage()
            .instance()
            .get(&patient_providers_key)
            .unwrap_or(Vec::new(&env));
            
        let mut updated_providers = Vec::new(&env);
        for i in 0..providers.len() {
            let addr = providers.get(i).unwrap();
            if addr != provider {
                updated_providers.push_back(addr);
            }
        }
        env.storage().instance().set(&patient_providers_key, &updated_providers);
        
        // Remove patient from provider's patient list
        let provider_patients_key = (symbol_short!("PRIDX"), provider.clone());
        let patients: Vec<Address> = env.storage()
            .instance()
            .get(&provider_patients_key)
            .unwrap_or(Vec::new(&env));
            
        let mut updated_patients = Vec::new(&env);
        for i in 0..patients.len() {
            let addr = patients.get(i).unwrap();
            if addr != patient {
                updated_patients.push_back(addr);
            }
        }
        env.storage().instance().set(&provider_patients_key, &updated_patients);
    }
}