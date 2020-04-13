/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { ShareAssetContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('ShareAssetContract', () => {

    let contract: ShareAssetContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new ShareAssetContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"share asset 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"share asset 1002 value"}'));
    });

    describe('#shareAssetExists', () => {

        it('should return true for a share asset', async () => {
            await contract.shareAssetExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a share asset that does not exist', async () => {
            await contract.shareAssetExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createShareAsset', () => {

        it('should create a share asset', async () => {
            await contract.createShareAsset(ctx, '1003', 'share asset 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"share asset 1003 value"}'));
        });

        it('should throw an error for a share asset that already exists', async () => {
            await contract.createShareAsset(ctx, '1001', 'myvalue').should.be.rejectedWith(/The share asset 1001 already exists/);
        });

    });

    describe('#readShareAsset', () => {

        it('should return a share asset', async () => {
            await contract.readShareAsset(ctx, '1001').should.eventually.deep.equal({ value: 'share asset 1001 value' });
        });

        it('should throw an error for a share asset that does not exist', async () => {
            await contract.readShareAsset(ctx, '1003').should.be.rejectedWith(/The share asset 1003 does not exist/);
        });

    });

    describe('#updateShareAsset', () => {

        it('should update a share asset', async () => {
            await contract.updateShareAsset(ctx, '1001', 'share asset 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"share asset 1001 new value"}'));
        });

        it('should throw an error for a share asset that does not exist', async () => {
            await contract.updateShareAsset(ctx, '1003', 'share asset 1003 new value').should.be.rejectedWith(/The share asset 1003 does not exist/);
        });

    });

    describe('#deleteShareAsset', () => {

        it('should delete a share asset', async () => {
            await contract.deleteShareAsset(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a share asset that does not exist', async () => {
            await contract.deleteShareAsset(ctx, '1003').should.be.rejectedWith(/The share asset 1003 does not exist/);
        });

    });

});
