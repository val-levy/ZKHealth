#![no_std]

use soroban_sdk::{contract, contractimpl, symbol_short, Env, Address, BytesN};

#[contract]
pub struct RelationshipContract;

#[contractimpl]
impl RelationshipContract {
    // Establish a patient ↔ provider relationship
    pub fn register_relationship(env: Env, patient: Address, provider: Address) {
        // Key: ("REL", patient, provider)
        let key = (symbol_short!("REL"), patient.clone(), provider.clone());
        env.storage().instance().set(&key, &true);
    }

    // Add an IPFS-CID pointer (BytesN<32>) under that relationship
    pub fn add_record(
        env: Env,
        patient: Address,
        provider: Address,
        record_hash: BytesN<32>,
    ) {
        // Check relationship exists
        let rel_key = (symbol_short!("REL"), patient.clone(), provider.clone());
        let has_rel: Option<bool> = env.storage().instance().get(&rel_key);
        if has_rel != Some(true) {
            panic!("No relationship established");
        }
        // Store the record pointer
        let rec_key = (symbol_short!("REC"), patient, provider, record_hash);
        env.storage().instance().set(&rec_key, &true);
    }

    // Query whether provider has access to that CID
    pub fn has_access(
        env: Env,
        patient: Address,
        provider: Address,
        record_hash: BytesN<32>,
    ) -> bool {
        let rec_key = (symbol_short!("REC"), patient, provider, record_hash);
        env.storage().instance().get(&rec_key).unwrap_or(false)
    }
}