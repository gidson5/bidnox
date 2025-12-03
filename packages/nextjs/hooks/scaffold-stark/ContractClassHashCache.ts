import { BlockIdentifier, ProviderInterface } from "starknet";

export class ContractClassHashCache {
    private static instance: ContractClassHashCache;
    private cache = new Map<string, string>();
    private pendingRequests = new Map<string, Promise<string | undefined>>();

    private constructor() {}

    public static getInstance(): ContractClassHashCache {
        if (!ContractClassHashCache.instance) {
            ContractClassHashCache.instance = new ContractClassHashCache();
        }
        return ContractClassHashCache.instance;
    }

    public async getClassHash(
        publicClient: ProviderInterface,
        address: string,
        blockIdentifier: BlockIdentifier = "latest"
    ): Promise<string | undefined> {
        const cacheKey = `${address}-${blockIdentifier}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }

        const pendingRequest = this.fetchClassHash(
            publicClient,
            address,
            blockIdentifier,
            cacheKey
        );
        this.pendingRequests.set(cacheKey, pendingRequest);

        try {
            return await pendingRequest;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    private async fetchClassHash(
        publicClient: ProviderInterface,
        address: string,
        blockIdentifier: BlockIdentifier,
        cacheKey: string
    ): Promise<string | undefined> {
        try {
            const classHash = await publicClient.getClassHashAt(
                address,
                blockIdentifier
            );
            this.cache.set(cacheKey, classHash);
            return classHash;
        } catch (error: any) {
            // Check if error is "Contract not found" - this is expected for some addresses
            const errorMessage = String(error?.message || error || "");
            const isContractNotFound =
                errorMessage.includes("Contract not found") ||
                errorMessage.includes("not found") ||
                error?.code === 20;

            if (!isContractNotFound) {
                // Only log unexpected errors
                console.error("Failed to fetch class hash:", error);
            }
            // Return undefined for both "contract not found" and other errors
            return undefined;
        }
    }

    public clear(): void {
        this.cache.clear();
        this.pendingRequests.clear();
    }
}
