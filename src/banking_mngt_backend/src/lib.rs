use candid::{CandidType, Deserialize};
use ic_cdk_macros::{init, query, update};

#[derive(Clone, CandidType, Deserialize)]
struct Account {
    id: u64,
    owner: String,
    balance: f64,
}

#[derive(Clone, CandidType, Deserialize)]
struct Transaction {
    from_account: u64,
    to_account: u64,
    amount: f64,
    timestamp: u64,
}

#[init]
fn init() {
    let accounts: Vec<Account> = Vec::new();
    let transactions: Vec<Transaction> = Vec::new();
    ic_cdk::storage::stable_save((accounts, transactions)).expect("Failed to initialize storage");
}

#[update]
fn create_account(owner: String) -> u64 {
    let (mut accounts, transactions) = ic_cdk::storage::stable_restore::<(Vec<Account>, Vec<Transaction>)>().unwrap();
    let account_id = accounts.len() as u64;
    accounts.push(Account {
        id: account_id,
        owner,
        balance: 0.0,
    });
    ic_cdk::storage::stable_save((accounts, transactions)).expect("Failed to save accounts");
    account_id
}

#[update]
fn process_transaction(from_account: u64, to_account: u64, amount: f64) -> Result<(), String> {
    let (mut accounts, mut transactions) = ic_cdk::storage::stable_restore::<(Vec<Account>, Vec<Transaction>)>().unwrap();

    // Find indices first to avoid multiple mutable borrows
    let from_idx = accounts.iter().position(|acc| acc.id == from_account);
    let to_idx = accounts.iter().position(|acc| acc.id == to_account);

    if let (Some(from_idx), Some(to_idx)) = (from_idx, to_idx) {
        let from = &mut accounts[from_idx];
        if from.balance >= amount {
            from.balance -= amount;
            let to = &mut accounts[to_idx];
            to.balance += amount;
            transactions.push(Transaction {
                from_account,
                to_account,
                amount,
                timestamp: ic_cdk::api::time(),
            });
            ic_cdk::storage::stable_save((accounts, transactions)).expect("Failed to save transactions");
            Ok(())
        } else {
            Err("Insufficient funds".to_string())
        }
    } else {
        Err("Account not found".to_string())
    }
}

#[query]
fn get_account(account_id: u64) -> Option<Account> {
    let (accounts, _) = ic_cdk::storage::stable_restore::<(Vec<Account>, Vec<Transaction>)>().unwrap();
    accounts.iter().find(|acc| acc.id == account_id).cloned()
}

#[query]
fn get_account_with_history(account_id: u64) -> Option<(Account, Vec<Transaction>)> {
    let (accounts, transactions) = ic_cdk::storage::stable_restore::<(Vec<Account>, Vec<Transaction>)>().unwrap();
    let account = accounts.iter().find(|acc| acc.id == account_id).cloned();
    let account_transactions = transactions.iter().filter(|tx| tx.from_account == account_id || tx.to_account == account_id).cloned().collect();
    account.map(|acc| (acc, account_transactions))
}
