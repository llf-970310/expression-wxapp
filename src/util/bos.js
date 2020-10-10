import { Base64 } from 'js-base64';
import CryptoJS from "crypto-js";
import Taro from "@tarojs/taro";

const bucketName = 'bos-parclab-exp'

export function uploadSoundToBOS(fileLocalPath, bosPath, onUploaded = function () { }) {
    var policy = `{"conditions":[{"bucket":"${bucketName}"},{"key":"${bosPath}"}]}`
    var policyBase64 = Base64.encode(policy)
    var signature = CryptoJS.HmacSHA256(policyBase64, "a244696b2607431090b4a0e7f5c0947a").toString(CryptoJS.enc.Hex)

    Taro.uploadFile({
        url: 'https://' + bucketName + '.su.bcebos.com',
        filePath: fileLocalPath,
        name: 'file',
        formData: {
            accessKey: '6ff21a46abcf4fa2828478d337f4f91b',
            policy: policyBase64,
            signature: signature,
            key: bosPath,    // 注意：这个key必须与policy中的key保持一致，否则会报错  
        },
        success(res) {
            if (res.statusCode == 200) {
                onUploaded()
            } else {
                console.log("upload to bos failed.")
                console.log(res)
            }
        },
        fail(e) {
            console.log(e)
        }
    })
}