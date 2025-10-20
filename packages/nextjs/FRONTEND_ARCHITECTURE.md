# Bidnox Auction Platform - Frontend Architecture

## 📁 File Structure

```
packages/nextjs/
├── app/
│   ├── auction/
│   │   ├── page.tsx                    # Main auction list page
│   │   ├── create/
│   │   │   └── page.tsx                # Create auction page
│   │   └── [id]/
│   │       └── page.tsx                # Auction detail page
│   └── layout.tsx
│
├── components/
│   ├── auction/
│   │   ├── AuctionList.tsx             # Lists all auctions
│   │   ├── AuctionCard.tsx             # Individual auction display
│   │   ├── AuctionDetails.tsx          # Detailed auction view
│   │   ├── CreateAuctionForm.tsx       # Form to create auction
│   │   ├── BidForm.tsx                 # Form to place sealed bid
│   │   ├── RevealBidForm.tsx           # Form to reveal bid
│   │   ├── FinalizeButton.tsx          # Button to finalize auction
│   │   ├── AuctionTimer.tsx            # Countdown timer
│   │   └── AuctionStatusBadge.tsx      # Status indicator
│   │
│   └── scaffold-stark/                  # Existing components
│       └── CustomConnectButton/         # Wallet connection
│
├── hooks/
│   ├── auction/
│   │   ├── useAuctionContract.ts       # Main auction contract hook
│   │   ├── useAuctionList.ts           # Fetch all auctions
│   │   ├── useAuctionDetails.ts        # Fetch single auction
│   │   ├── useCreateAuction.ts         # Create auction
│   │   ├── usePlaceBid.ts              # Place sealed bid
│   │   ├── useRevealBid.ts             # Reveal bid
│   │   └── useFinalize.ts              # Finalize auction
│   │
│   └── scaffold-stark/                  # Existing hooks
│       ├── useScaffoldReadContract.ts
│       └── useScaffoldWriteContract.ts
│
├── utils/
│   └── auction/
│       ├── auctionHelpers.ts           # Helper functions
│       ├── bidHashing.ts               # Bid hash computation
│       └── timeUtils.ts                # Time formatting
│
└── contracts/
    └── deployedContracts.ts            # Contract addresses/ABIs
```

## 🎯 Component Responsibilities

### Pages

#### `/auction` - Main Auction List Page

- Display all active auctions
- Filter by status (active, ended, finalized)
- Connect wallet prompt if not connected
- Link to create new auction

#### `/auction/create` - Create Auction Page

- Form with fields: asset_id, starting_price, duration
- Input validation
- Transaction status feedback
- Redirect to auction detail on success

#### `/auction/[id]` - Auction Detail Page

- Full auction information
- Countdown timer
- Bid form (if active)
- Reveal form (if ended)
- Finalize button (if seller)
- Bid history/status

### Components

#### `AuctionList`

- **Props**: `filter?: 'all' | 'active' | 'ended'`
- **Reads**: All auctions from contract
- **Displays**: Grid of AuctionCard components
- **Loading/Error**: Skeleton states

#### `AuctionCard`

- **Props**: `auctionId: bigint`
- **Reads**: Auction details
- **Displays**: Asset ID, price, timer, status
- **Actions**: Click to view details

#### `AuctionDetails`

- **Props**: `auctionId: bigint`
- **Reads**: Full auction data, user's bid
- **Displays**: All auction info, seller, highest bid
- **Conditional**: Shows appropriate forms based on state

#### `CreateAuctionForm`

- **State**: Form inputs (asset_id, price, duration)
- **Validation**: Required fields, positive values
- **Writes**: Calls create_auction
- **Feedback**: Transaction status, success/error

#### `BidForm`

- **Props**: `auctionId: bigint, startingPrice: bigint`
- **State**: Bid amount, secret
- **Computes**: Bid hash using contract function
- **Writes**: Calls place_bid with hash
- **Stores**: Secret in local storage (encrypted)

#### `RevealBidForm`

- **Props**: `auctionId: bigint`
- **Reads**: Stored secret from localStorage
- **State**: Bid amount, secret
- **Writes**: Calls reveal_bid
- **Clears**: Secret after successful reveal

#### `FinalizeButton`

- **Props**: `auctionId: bigint, sellerAddress: string`
- **Checks**: User is seller, auction ended
- **Writes**: Calls finalize_auction
- **Feedback**: Transaction status

#### `AuctionTimer`

- **Props**: `endTime: bigint`
- **State**: Remaining time (updates every second)
- **Displays**: Countdown or "Ended"
- **Effect**: Auto-update component

#### `AuctionStatusBadge`

- **Props**: `status: AuctionStatus`
- **Displays**: Colored badge (Active, Ended, Finalized, Cancelled)

## 🔌 Custom Hooks

### `useAuctionContract()`

Main wrapper hook that provides:

- Contract instance
- Read/write functions
- Transaction state
- Error handling

### `useAuctionList(filter?)`

- Fetches total auction count
- Fetches all auction details
- Filters by status
- Returns: `{ auctions, isLoading, error }`

### `useAuctionDetails(auctionId)`

- Fetches single auction data
- Fetches user's bid (if exists)
- Auto-refreshes based on status
- Returns: `{ auction, userBid, isLoading, error }`

### `useCreateAuction()`

- Wraps create_auction write
- Input validation
- Transaction tracking
- Returns: `{ createAuction, isPending, isSuccess, error }`

### `usePlaceBid(auctionId)`

- Computes bid hash
- Stores secret locally
- Calls place_bid
- Returns: `{ placeBid, isPending, isSuccess, error }`

### `useRevealBid(auctionId)`

- Retrieves stored secret
- Calls reveal_bid
- Clears secret on success
- Returns: `{ revealBid, isPending, isSuccess, error }`

### `useFinalize(auctionId)`

- Permission check
- Calls finalize_auction
- Returns: `{ finalize, isPending, isSuccess, error }`

## 🎨 UI/UX Flow

### User Journey - Placing a Bid

1. **Connect Wallet** → CustomConnectButton (existing)
2. **Browse Auctions** → AuctionList shows all active auctions
3. **Select Auction** → Click AuctionCard → Navigate to detail page
4. **View Details** → See timer, current bid, requirements
5. **Place Bid** → BidForm → Enter amount + secret → Submit
6. **Wait for End** → Timer counts down
7. **Reveal Bid** → RevealBidForm → Auto-fills secret → Submit
8. **Check Result** → See if you won

### User Journey - Creating an Auction

1. **Connect Wallet** → Required to create
2. **Click "Create Auction"** → Navigate to create page
3. **Fill Form** → Asset ID, Starting Price, Duration
4. **Submit** → Transaction confirmation
5. **Success** → Redirect to auction detail page

### User Journey - Finalizing (Seller)

1. **Navigate to Auction** → Your created auction
2. **Wait for End** → Timer shows countdown
3. **After End** → "Finalize" button appears
4. **Click Finalize** → Transaction confirmation
5. **Success** → Winner announced

## 🔐 State Management

### Global Context (Existing)

- Wallet connection (Scaffold-Stark)
- Network state (targetNetwork)
- Account address

### Local Storage

- Bid secrets (encrypted): `bid_secret_${auctionId}_${address}`
- Recently viewed auctions
- Filter preferences

### Component State

- Form inputs
- Loading states
- Error messages
- Transaction status

## 🎯 Key Features

1. **Real-time Updates**
    - Timer updates every second
    - Auto-refresh auction data
    - Watch for events

2. **Responsive Design**
    - Mobile-friendly grid
    - Touch-optimized forms
    - Adaptive navigation

3. **Error Handling**
    - Clear error messages
    - Retry mechanisms
    - Validation feedback

4. **Transaction Feedback**
    - Loading indicators
    - Success notifications
    - Error alerts
    - Progress tracking

5. **Smart Defaults**
    - Pre-fill forms where possible
    - Remember preferences
    - Suggest bid amounts

## 🚀 Implementation Order

1. ✅ Set up file structure
2. ✅ Create utility functions
3. ✅ Build custom hooks
4. ✅ Create reusable components
5. ✅ Build pages
6. ✅ Add styling
7. ✅ Test flows
8. ✅ Polish UX
