#![no_std]

use soroban_sdk::{contract, contractimpl, symbol_short, Env, Address, Symbol};

#[contract]
pub struct AgentContract;

#[contractimpl]
impl AgentContract {
    /// Register an agent with a role (PAT or PRO)
    pub fn register_agent(env: Env, agent: Address, role: Symbol) {
        env.storage().instance().set(&(&agent,), &role);
    }

    /// Retrieve the role of an agent
    pub fn get_role(env: Env, agent: Address) -> Symbol {
        env.storage().instance().get(&(&agent,)).unwrap()
    }

    /// Check if an agent is a patient
    pub fn is_patient(env: Env, agent: Address) -> bool {
        env.storage()
            .instance()
            .get(&(&agent,))
            .unwrap_or(symbol_short!("PAT"))
            == symbol_short!("PAT")
    }

    /// Check if an agent is a provider
    pub fn is_provider(env: Env, agent: Address) -> bool {
        env.storage()
            .instance()
            .get(&(&agent,))
            .unwrap_or(symbol_short!("PRO"))
            == symbol_short!("PRO")
    }

    /// Delete an agent, removing their role entry
    pub fn delete_agent(env: Env, agent: Address) {
        env.storage().instance().remove(&(&agent,));
    }
}
