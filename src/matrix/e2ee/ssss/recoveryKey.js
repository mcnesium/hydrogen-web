/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import {base58} from "../../../utils/base-encoding.js";
import {Key} from "./common.js";

const OLM_RECOVERY_KEY_PREFIX = [0x8B, 0x01];

/**
 * @param  {Olm} olm
 * @param  {KeyDescription} keyDescription
 * @param  {string} recoveryKey
 * @return {Key}
 */
export function keyFromRecoveryKey(olm, keyDescription, recoveryKey) {
    const result = base58.decode(recoveryKey.replace(/ /g, ''));

    let parity = 0;
    for (const b of result) {
        parity ^= b;
    }
    if (parity !== 0) {
        throw new Error("Incorrect parity");
    }

    for (let i = 0; i < OLM_RECOVERY_KEY_PREFIX.length; ++i) {
        if (result[i] !== OLM_RECOVERY_KEY_PREFIX[i]) {
            throw new Error("Incorrect prefix");
        }
    }

    if (
        result.length !==
        OLM_RECOVERY_KEY_PREFIX.length + olm.PRIVATE_KEY_LENGTH + 1
    ) {
        throw new Error("Incorrect length");
    }

    const keyBits = Uint8Array.from(result.slice(
        OLM_RECOVERY_KEY_PREFIX.length,
        OLM_RECOVERY_KEY_PREFIX.length + olm.PRIVATE_KEY_LENGTH,
    ));

    return new Key(keyDescription, keyBits);
}