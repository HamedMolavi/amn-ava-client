import { KeyHelper, KeyPairType, PreKeyPairType, SignedPreKeyPairType } from "@privacyresearch/libsignal-protocol-typescript";

type bundle = {
  identityKey: KeyPairType<ArrayBuffer>
  signedPreKey: SignedPreKeyPairType<ArrayBuffer>
  preKeys: Array<PreKeyPairType<ArrayBuffer>>
}

class Server {

}

class Person {
  identityKey: KeyPairType<ArrayBuffer> | undefined // only once
  ephemeralKey: KeyPairType<ArrayBuffer> | undefined // only once
  signedPreKey: SignedPreKeyPairType<ArrayBuffer> | undefined // regular intervals (weekly)
  preKeys: { [preKeyId: number]: PreKeyPairType<ArrayBuffer> } // irregular intervals (when empty)

  constructor() {
    this.preKeys = [];
    const signedPreKeyId = 0//makeKeyId()
    KeyHelper.generateIdentityKeyPair()
      .then(async (identityKey) => {
        this.identityKey = identityKey;
        this.ephemeralKey = await KeyHelper.generateIdentityKeyPair();

        const signedPreKey = await KeyHelper.generateSignedPreKey(identityKey, signedPreKeyId);
        this.signedPreKey = signedPreKey;

        for (const preKeyId of [0, 1, 2]) {
          const preKeyId = 0//makeKeyId()
          const preKey = await KeyHelper.generatePreKey(preKeyId);
          this.preKeys[preKey.keyId] = preKey;
        };

        return;
      })
  }

  async getPeopleKeys(): Promise<bundle> {
    return { identityKey: undefined, signedPreKey: undefined, preKeys: undefined }
  }

  async verify(publicKey: ArrayBuffer, signature: ArrayBuffer) {
    const calculatedSignature: ArrayBuffer = [];
    return calculatedSignature === signature;
  }

  async initX3DH(other: Person) {
    const dh1 = dh(this.identityKey, other.signedPreKey?.keyPair.pubKey)
    const dh2 = dh(this.ephemeralKey, other.identityKey?.pubKey)
    const dh3 = dh(this.ephemeralKey, other.signedPreKey?.keyPair.pubKey)
    // if (!!other.preKeys.length)
    const dh4 = dh(this.ephemeralKey, other.preKeys[0].keyPair.pubKey)

    const sharedKey = KDF(dh1 + dh2 + dh3 + dh4)

    const associatedData = encode(this.identityKey) + encode(other.identityKey)
    return {
      identityKey: this.identityKey,
      ephemeralKey: this.ephemeralKey,
      keyId: other.preKeys[0].keyId,
      associatedData
    }
  }

  async retX3DH(other: Person, preKeyId: number, associatedData: any) {
    const dh1 = dh(this.signedPreKey, other.identityKey?.pubKey)
    const dh2 = dh(this.identityKey, other.ephemeralKey?.pubKey)
    const dh3 = dh(this.signedPreKey, other.ephemeralKey?.pubKey)
    // if (!!other.preKeys.length)
    const dh4 = dh(this.preKeys[preKeyId], other.ephemeralKey?.pubKey)

    const sharedKey = KDF(dh1 + dh2 + dh3 + dh4)

    const calculatedAssociatedData = encode(this.identityKey) + encode(other.identityKey)
    // if (calculatedAssociatedData === associatedData)
    return {
      identityKey: this.identityKey,
      ephemeralKey: this.ephemeralKey,
      keyId: other.preKeys[0].keyId,
      associatedData
    }
  }

}