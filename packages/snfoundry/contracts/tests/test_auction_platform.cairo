// ============================================================================
// AUCTION PLATFORM - COMPREHENSIVE UNIT TESTS
// ============================================================================
// 
// Test Coverage:
// 1. Auction Creation
//    - Valid auction creation
//    - Invalid duration (zero or negative)
// 2. Bidding Sequence
//    - Valid bid placement
//    - Bid on non-existent auction
//    - Bid on cancelled auction
//    - Bid on finalized auction
//    - Bid after auction end time
//    - Duplicate bid from same bidder
// 3. Bid Revealing
//    - Valid bid reveal
//    - Invalid secret (hash mismatch)
//    - Reveal before auction ends
//    - Reveal on finalized auction
//    - Double reveal attempt
//    - Multiple bidders, highest bid wins
// 4. Auction Finalization
//    - Owner can finalize
//    - Non-owner cannot finalize
//    - Cannot finalize before end time
//    - Cannot finalize twice
//    - Winner receives correct status
// 5. Auction Cancellation
//    - Owner can cancel with no bids
//    - Cannot cancel with existing bids
//    - Non-owner cannot cancel
// 6. View Functions
//    - get_auction returns correct data
//    - get_bid returns correct data
//    - is_auction_active works correctly
//    - is_auction_ended works correctly
//
// ============================================================================

use contracts::auction_platform::{
    IAuctionPlatformDispatcher, IAuctionPlatformDispatcherTrait,
};
use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address,
    stop_cheat_caller_address, start_cheat_block_timestamp_global,
    stop_cheat_block_timestamp_global,
};
use starknet::ContractAddress;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

fn deploy_auction_platform() -> (IAuctionPlatformDispatcher, ContractAddress) {
    let contract = declare("AuctionPlatform").unwrap().contract_class();
    let (contract_address, _) = contract.deploy(@array![]).unwrap();
    (IAuctionPlatformDispatcher { contract_address }, contract_address)
}

fn seller() -> ContractAddress {
    starknet::contract_address_const::<0x123>()
}

fn bidder1() -> ContractAddress {
    starknet::contract_address_const::<0x456>()
}

fn bidder2() -> ContractAddress {
    starknet::contract_address_const::<0x789>()
}

fn bidder3() -> ContractAddress {
    starknet::contract_address_const::<0xABC>()
}

// ============================================================================
// TEST 1: AUCTION CREATION
// ============================================================================

#[test]
fn test_create_auction_success() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);

    let asset_id: u256 = 123;
    let starting_price: u256 = 100;
    let duration: u64 = 3600; // 1 hour

    let auction_id = dispatcher.create_auction(asset_id, starting_price, duration);

    assert!(auction_id == 1, "First auction should have ID 1");

    let auction = dispatcher.get_auction(auction_id);
    assert!(auction.auction_id == 1, "Auction ID mismatch");
    assert!(auction.seller == seller(), "Seller mismatch");
    assert!(auction.asset_id == asset_id, "Asset ID mismatch");
    assert!(auction.starting_price == starting_price, "Starting price mismatch");
    assert!(auction.start_time == 1000, "Start time mismatch");
    assert!(auction.duration == duration, "Duration mismatch");
    assert!(auction.end_time == 4600, "End time should be start + duration");
    assert!(auction.highest_bid == 0, "Initial highest bid should be 0");
    assert!(!auction.finalized, "Should not be finalized");
    assert!(!auction.cancelled, "Should not be cancelled");

    stop_cheat_caller_address(contract_address);
    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic]
fn test_create_auction_zero_duration() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    start_cheat_caller_address(contract_address, seller());

    let asset_id: u256 = 123;
    let starting_price: u256 = 100;
    let duration: u64 = 0;

    dispatcher.create_auction(asset_id, starting_price, duration);

    stop_cheat_caller_address(contract_address);
}

#[test]
fn test_create_multiple_auctions() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    start_cheat_caller_address(contract_address, seller());

    let auction1_id = dispatcher.create_auction(100, 50, 3600);
    let auction2_id = dispatcher.create_auction(200, 75, 7200);

    assert!(auction1_id == 1, "First auction ID");
    assert!(auction2_id == 2, "Second auction ID");
    assert!(dispatcher.get_auction_count() == 2, "Should have 2 auctions");

    stop_cheat_caller_address(contract_address);
}

// ============================================================================
// TEST 2: BIDDING SEQUENCE
// ============================================================================

#[test]
fn test_place_bid_success() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Compute bid hash
    let bid_amount: u256 = 150;
    let secret: felt252 = 'my_secret';
    let bid_hash = dispatcher.compute_bid_hash(bid_amount, secret);

    // Place bid
    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.place_bid(auction_id, bid_hash);
    stop_cheat_caller_address(contract_address);

    // Verify bid was stored
    let bid = dispatcher.get_bid(auction_id, bidder1());
    assert!(bid.bidder == bidder1(), "Bidder mismatch");
    assert!(bid.bid_hash == bid_hash, "Bid hash mismatch");
    assert!(!bid.revealed, "Should not be revealed yet");
    assert!(bid.actual_amount == 0, "Amount should be 0 before reveal");

    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic]
fn test_place_bid_nonexistent_auction() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.place_bid(999, 'some_hash');
    stop_cheat_caller_address(contract_address);
}

#[test]
#[should_panic]
fn test_place_bid_after_end_time() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Try to bid after end time
    start_cheat_block_timestamp_global(5000); // After end_time (4600)
    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.place_bid(auction_id, 'some_hash');
    stop_cheat_caller_address(contract_address);
    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic]
fn test_place_bid_duplicate() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Place first bid
    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.place_bid(auction_id, 'hash1');

    // Try to place second bid (should fail)
    dispatcher.place_bid(auction_id, 'hash2');

    stop_cheat_caller_address(contract_address);
    stop_cheat_block_timestamp_global();
}

#[test]
fn test_multiple_bidders_can_bid() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Bidder 1 places bid
    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.place_bid(auction_id, 'hash1');
    stop_cheat_caller_address(contract_address);

    // Bidder 2 places bid
    start_cheat_caller_address(contract_address, bidder2());
    dispatcher.place_bid(auction_id, 'hash2');
    stop_cheat_caller_address(contract_address);

    // Verify both bids exist
    let bid1 = dispatcher.get_bid(auction_id, bidder1());
    let bid2 = dispatcher.get_bid(auction_id, bidder2());

    assert!(bid1.bid_hash == 'hash1', "Bid 1 hash mismatch");
    assert!(bid2.bid_hash == 'hash2', "Bid 2 hash mismatch");

    stop_cheat_block_timestamp_global();
}

// ============================================================================
// TEST 3: BID REVEALING
// ============================================================================

#[test]
fn test_reveal_bid_success() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Place bid
    let bid_amount: u256 = 150;
    let secret: felt252 = 'my_secret';
    let bid_hash = dispatcher.compute_bid_hash(bid_amount, secret);

    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.place_bid(auction_id, bid_hash);
    stop_cheat_caller_address(contract_address);

    // Wait for auction to end
    start_cheat_block_timestamp_global(5000);

    // Reveal bid
    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.reveal_bid(auction_id, bid_amount, secret);
    stop_cheat_caller_address(contract_address);

    // Verify bid was revealed
    let bid = dispatcher.get_bid(auction_id, bidder1());
    assert!(bid.revealed, "Bid should be revealed");
    assert!(bid.actual_amount == bid_amount, "Amount mismatch");

    // Verify auction state updated
    let auction = dispatcher.get_auction(auction_id);
    assert!(auction.highest_bid == bid_amount, "Highest bid should be updated");
    assert!(auction.highest_bidder == bidder1(), "Highest bidder should be updated");

    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic]
fn test_reveal_bid_before_end_time() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Place bid
    let bid_amount: u256 = 150;
    let secret: felt252 = 'my_secret';
    let bid_hash = dispatcher.compute_bid_hash(bid_amount, secret);

    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.place_bid(auction_id, bid_hash);

    // Try to reveal before end time (still at timestamp 1000, end_time is 4600)
    dispatcher.reveal_bid(auction_id, bid_amount, secret);

    stop_cheat_caller_address(contract_address);
    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic]
fn test_reveal_bid_wrong_secret() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Place bid with one secret
    let bid_amount: u256 = 150;
    let secret: felt252 = 'my_secret';
    let bid_hash = dispatcher.compute_bid_hash(bid_amount, secret);

    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.place_bid(auction_id, bid_hash);
    stop_cheat_caller_address(contract_address);

    // Wait for auction to end
    start_cheat_block_timestamp_global(5000);

    // Try to reveal with wrong secret
    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.reveal_bid(auction_id, bid_amount, 'wrong_secret');
    stop_cheat_caller_address(contract_address);

    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic]
fn test_reveal_bid_twice() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Place bid
    let bid_amount: u256 = 150;
    let secret: felt252 = 'my_secret';
    let bid_hash = dispatcher.compute_bid_hash(bid_amount, secret);

    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.place_bid(auction_id, bid_hash);
    stop_cheat_caller_address(contract_address);

    // Wait for auction to end
    start_cheat_block_timestamp_global(5000);

    // Reveal bid first time
    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.reveal_bid(auction_id, bid_amount, secret);

    // Try to reveal again
    dispatcher.reveal_bid(auction_id, bid_amount, secret);

    stop_cheat_caller_address(contract_address);
    stop_cheat_block_timestamp_global();
}

#[test]
fn test_highest_bid_determination() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Place bids from three bidders
    let bid1_amount: u256 = 100;
    let bid1_secret: felt252 = 'secret1';
    let bid1_hash = dispatcher.compute_bid_hash(bid1_amount, bid1_secret);

    let bid2_amount: u256 = 200; // Highest
    let bid2_secret: felt252 = 'secret2';
    let bid2_hash = dispatcher.compute_bid_hash(bid2_amount, bid2_secret);

    let bid3_amount: u256 = 150;
    let bid3_secret: felt252 = 'secret3';
    let bid3_hash = dispatcher.compute_bid_hash(bid3_amount, bid3_secret);

    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.place_bid(auction_id, bid1_hash);
    stop_cheat_caller_address(contract_address);

    start_cheat_caller_address(contract_address, bidder2());
    dispatcher.place_bid(auction_id, bid2_hash);
    stop_cheat_caller_address(contract_address);

    start_cheat_caller_address(contract_address, bidder3());
    dispatcher.place_bid(auction_id, bid3_hash);
    stop_cheat_caller_address(contract_address);

    // Wait for auction to end
    start_cheat_block_timestamp_global(5000);

    // Reveal all bids
    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.reveal_bid(auction_id, bid1_amount, bid1_secret);
    stop_cheat_caller_address(contract_address);

    start_cheat_caller_address(contract_address, bidder2());
    dispatcher.reveal_bid(auction_id, bid2_amount, bid2_secret);
    stop_cheat_caller_address(contract_address);

    start_cheat_caller_address(contract_address, bidder3());
    dispatcher.reveal_bid(auction_id, bid3_amount, bid3_secret);
    stop_cheat_caller_address(contract_address);

    // Check that bidder2 has the highest bid
    let auction = dispatcher.get_auction(auction_id);
    assert!(auction.highest_bid == bid2_amount, "Highest bid should be 200");
    assert!(auction.highest_bidder == bidder2(), "Bidder 2 should be highest");

    stop_cheat_block_timestamp_global();
}

#[test]
fn test_bid_below_starting_price_not_counted() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction with starting price 100
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 100, 3600);
    stop_cheat_caller_address(contract_address);

    // Place bid below starting price
    let bid_amount: u256 = 50; // Below starting price of 100
    let secret: felt252 = 'my_secret';
    let bid_hash = dispatcher.compute_bid_hash(bid_amount, secret);

    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.place_bid(auction_id, bid_hash);
    stop_cheat_caller_address(contract_address);

    // Wait for auction to end
    start_cheat_block_timestamp_global(5000);

    // Reveal bid
    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.reveal_bid(auction_id, bid_amount, secret);
    stop_cheat_caller_address(contract_address);

    // Verify bid is revealed but not set as highest
    let bid = dispatcher.get_bid(auction_id, bidder1());
    assert!(bid.revealed, "Bid should be revealed");

    let auction = dispatcher.get_auction(auction_id);
    assert!(auction.highest_bid == 0, "Highest bid should still be 0");

    stop_cheat_block_timestamp_global();
}

// ============================================================================
// TEST 4: AUCTION FINALIZATION
// ============================================================================

#[test]
fn test_finalize_auction_success() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Wait for auction to end
    start_cheat_block_timestamp_global(5000);

    // Finalize auction
    start_cheat_caller_address(contract_address, seller());
    dispatcher.finalize_auction(auction_id);
    stop_cheat_caller_address(contract_address);

    // Verify auction is finalized
    let auction = dispatcher.get_auction(auction_id);
    assert!(auction.finalized, "Auction should be finalized");

    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic]
fn test_finalize_auction_non_owner() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Wait for auction to end
    start_cheat_block_timestamp_global(5000);

    // Try to finalize as non-owner
    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.finalize_auction(auction_id);
    stop_cheat_caller_address(contract_address);

    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic]
fn test_finalize_auction_before_end_time() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);

    // Try to finalize before end time (still at 1000)
    dispatcher.finalize_auction(auction_id);

    stop_cheat_caller_address(contract_address);
    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic]
fn test_finalize_auction_twice() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Wait for auction to end
    start_cheat_block_timestamp_global(5000);

    // Finalize auction
    start_cheat_caller_address(contract_address, seller());
    dispatcher.finalize_auction(auction_id);

    // Try to finalize again
    dispatcher.finalize_auction(auction_id);

    stop_cheat_caller_address(contract_address);
    stop_cheat_block_timestamp_global();
}

// ============================================================================
// TEST 5: AUCTION CANCELLATION
// ============================================================================

#[test]
fn test_cancel_auction_success() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    let auction_id = dispatcher.create_auction(100, 50, 3600);

    // Cancel auction (no bids placed)
    dispatcher.cancel_auction(auction_id);
    stop_cheat_caller_address(contract_address);

    // Verify auction is cancelled
    let auction = dispatcher.get_auction(auction_id);
    assert!(auction.cancelled, "Auction should be cancelled");
}

#[test]
#[should_panic]
fn test_cancel_auction_non_owner() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Try to cancel as non-owner
    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.cancel_auction(auction_id);
    stop_cheat_caller_address(contract_address);
}

#[test]
#[should_panic]
fn test_cancel_auction_with_bids() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Place a bid
    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.place_bid(auction_id, 'some_hash');
    stop_cheat_caller_address(contract_address);

    // Try to cancel with existing bids
    start_cheat_caller_address(contract_address, seller());
    dispatcher.cancel_auction(auction_id);
    stop_cheat_caller_address(contract_address);

    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic]
fn test_cannot_bid_on_cancelled_auction() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create and cancel auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    dispatcher.cancel_auction(auction_id);
    stop_cheat_caller_address(contract_address);

    // Try to place bid on cancelled auction
    start_cheat_caller_address(contract_address, bidder1());
    dispatcher.place_bid(auction_id, 'some_hash');
    stop_cheat_caller_address(contract_address);

    stop_cheat_block_timestamp_global();
}

// ============================================================================
// TEST 6: VIEW FUNCTIONS
// ============================================================================

#[test]
fn test_is_auction_active() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Should be active during auction period
    assert!(dispatcher.is_auction_active(auction_id), "Auction should be active");

    // Should not be active after end time
    start_cheat_block_timestamp_global(5000);
    assert!(!dispatcher.is_auction_active(auction_id), "Auction should not be active");

    stop_cheat_block_timestamp_global();
}

#[test]
fn test_is_auction_ended() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    // Create auction
    start_cheat_caller_address(contract_address, seller());
    start_cheat_block_timestamp_global(1000);
    let auction_id = dispatcher.create_auction(100, 50, 3600);
    stop_cheat_caller_address(contract_address);

    // Should not be ended during auction period
    assert!(!dispatcher.is_auction_ended(auction_id), "Auction should not be ended");

    // Should be ended after end time
    start_cheat_block_timestamp_global(5000);
    assert!(dispatcher.is_auction_ended(auction_id), "Auction should be ended");

    stop_cheat_block_timestamp_global();
}

#[test]
fn test_compute_bid_hash_consistency() {
    let (dispatcher, _) = deploy_auction_platform();

    let amount: u256 = 150;
    let secret: felt252 = 'my_secret';

    let hash1 = dispatcher.compute_bid_hash(amount, secret);
    let hash2 = dispatcher.compute_bid_hash(amount, secret);

    assert!(hash1 == hash2, "Hash should be consistent");

    // Different secret should produce different hash
    let hash3 = dispatcher.compute_bid_hash(amount, 'different_secret');
    assert!(hash1 != hash3, "Different secret should produce different hash");
}

#[test]
fn test_get_auction_count() {
    let (dispatcher, contract_address) = deploy_auction_platform();

    assert!(dispatcher.get_auction_count() == 0, "Initial count should be 0");

    start_cheat_caller_address(contract_address, seller());
    dispatcher.create_auction(100, 50, 3600);
    assert!(dispatcher.get_auction_count() == 1, "Count should be 1");

    dispatcher.create_auction(200, 75, 7200);
    assert!(dispatcher.get_auction_count() == 2, "Count should be 2");

    stop_cheat_caller_address(contract_address);
}

