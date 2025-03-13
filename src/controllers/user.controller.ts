import config from "../config/config.js";
import type { NextFunction, Request, Response } from "express";
import { Connection, PublicKey } from "@solana/web3.js";
import { HttpException } from "../utils/errors.js";
import { QuartzClient, type QuartzUser, MarketIndex, retryWithBackoff } from "@quartz-labs/sdk";
import { Controller } from "../types/controller.class.js";

export class UserController extends Controller{
    private quartzClientPromise: Promise<QuartzClient>;
    private connection: Connection;

    constructor() {
        super();
        this.connection = new Connection(config.RPC_URL);
        this.quartzClientPromise = QuartzClient.fetchClient(this.connection);
    }

    private validateAddress(address: string): PublicKey {
        try {
            const pubkey = new PublicKey(address);
            return pubkey;
        } catch {
            throw new HttpException(400, "Invalid address");
        }
    }

    private async getQuartzUser(pubkey: PublicKey): Promise<QuartzUser> {
        try {
            const quartzClient = await this.quartzClientPromise || QuartzClient.fetchClient(this.connection);    
            return await retryWithBackoff(
                () => quartzClient.getQuartzAccount(pubkey),
                2
            )
        } catch {
            throw new HttpException(400, "Quartz account not found");
        }
    }

    private validateMarketIndices(marketIndicesParam: string) {
        if (!marketIndicesParam) {
            throw new HttpException(400, "Market indices are required");
        }

        const decodedMarketIndices = decodeURIComponent(marketIndicesParam);
        const marketIndices = decodedMarketIndices.split(',').map(Number).filter(n => !Number.isNaN(n));
        if (marketIndices.length === 0) {
            throw new HttpException(400, "Invalid market index");
        }

        if (marketIndices.some(index => !MarketIndex.includes(index as any))) {
            throw new HttpException(400, "Unsupported market index");
        }

        return marketIndices as MarketIndex[];
    }

    public getBalance = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const marketIndices = this.validateMarketIndices(req.query.marketIndices as string);
            const address = this.validateAddress(req.query.address as string);
            const user = await this.getQuartzUser(address);

            const balancesBN = await retryWithBackoff(
                () => user.getMultipleTokenBalances(marketIndices),
                3
            );

            const balances = Object.entries(balancesBN).reduce((acc, [index, balance]) =>
                Object.assign(acc, {
                    [index]: balance.toNumber()
                }),
                {} as Record<MarketIndex, number>
            );

            res.status(200).json(balances);
        } catch (error) {
            next(error);
        }
    }

    public getWithdrawLimit = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const marketIndices = this.validateMarketIndices(req.query.marketIndices as string);
            const address = this.validateAddress(req.query.address as string);
            const user = await this.getQuartzUser(address);

            const withdrawLimits = await retryWithBackoff(
                () => user.getMultipleWithdrawalLimits(marketIndices, true),
                3
            );

            res.status(200).json(withdrawLimits);
        } catch (error) {
            next(error);
        }
    }

    public getBorrowLimit = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const marketIndices = this.validateMarketIndices(req.query.marketIndices as string);
            const address = this.validateAddress(req.query.address as string);
            const user = await this.getQuartzUser(address);

            const borrowLimits = await retryWithBackoff(
                () => user.getMultipleWithdrawalLimits(marketIndices, false),
                3
            );

            res.status(200).json(borrowLimits);
        } catch (error) {
            next(error);
        }
    }

    public getHealth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const address = this.validateAddress(req.query.address as string);
            const user = await this.getQuartzUser(address);
            const health = user.getHealth();
            res.status(200).json(health);
        } catch (error) {
            next(error);
        }
    }

    public getSpendableBalance = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const address = this.validateAddress(req.query.address as string);
            const user = await this.getQuartzUser(address);
            const spendableBalance = await user.getSpendableBalanceUsdcBaseUnits();

            res.status(200).json(spendableBalance);
        } catch (error) {
            next(error);
        }
    }
}
