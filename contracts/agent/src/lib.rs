#![no_std]

use soroban_sdk::{contract, contractimpl, symbol_short, Env, Address, Symbol};

#[contract]
pub struct AgentContract;

#[contractimpl]
impl AgentContract {
    pub fn register_agent(env: Env, agent: Address, role: Symbol) {
        // Store the agent's role under a one‐element tuple key
        env.storage().instance().set(&(&agent,), &role);
    }

    pub fn get_role(env: Env, agent: Address) -> Symbol {
        // Retrieve and return the stored role (unwrap safe if always registered)
        env.storage().instance().get(&(&agent,)).unwrap()
    }

    pub fn is_patient(env: Env, agent: Address) -> bool {
        // Compare stored role to "PAT"
        env.storage().instance().get(&(&agent,)) == Some(symbol_short!("PAT"))
    }

    pub fn is_provider(env: Env, agent: Address) -> bool {
        // Compare stored role to "PRO"
        env.storage().instance().get(&(&agent,)) == Some(symbol_short!("PRO"))
    }
}
