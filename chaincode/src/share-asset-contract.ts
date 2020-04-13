/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { ShareAsset } from './share-asset';

@Info({title: 'ShareAssetContract', description: 'My Smart Contract' })
export class ShareAssetContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async shareAssetExists(ctx: Context, shareAssetId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(shareAssetId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createShareAsset(ctx: Context, shareAssetId: string, value: string): Promise<void> {
        const exists = await this.shareAssetExists(ctx, shareAssetId);
        if (exists) {
            throw new Error(`The share asset ${shareAssetId} already exists`);
        }
        const shareAsset = new ShareAsset();
        shareAsset.value = value;
        const buffer = Buffer.from(JSON.stringify(shareAsset));
        await ctx.stub.putState(shareAssetId, buffer);
    }

    @Transaction(false)
    @Returns('ShareAsset')
    public async readShareAsset(ctx: Context, shareAssetId: string): Promise<ShareAsset> {
        const exists = await this.shareAssetExists(ctx, shareAssetId);
        if (!exists) {
            throw new Error(`The share asset ${shareAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(shareAssetId);
        const shareAsset = JSON.parse(buffer.toString()) as ShareAsset;
        return shareAsset;
    }

    @Transaction()
    public async updateShareAsset(ctx: Context, shareAssetId: string, newValue: string): Promise<void> {
        const exists = await this.shareAssetExists(ctx, shareAssetId);
        if (!exists) {
            throw new Error(`The share asset ${shareAssetId} does not exist`);
        }
        const shareAsset = new ShareAsset();
        shareAsset.value = newValue;
        const buffer = Buffer.from(JSON.stringify(shareAsset));
        await ctx.stub.putState(shareAssetId, buffer);
    }

    @Transaction()
    public async deleteShareAsset(ctx: Context, shareAssetId: string): Promise<void> {
        const exists = await this.shareAssetExists(ctx, shareAssetId);
        if (!exists) {
            throw new Error(`The share asset ${shareAssetId} does not exist`);
        }
        await ctx.stub.deleteState(shareAssetId);
    }

}
