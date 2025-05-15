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
}
