/*!

* Coded by DriverHive

*/

// firebase config
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();
const db = admin.firestore();

// sendgrid config
import * as sgMail from "@sendgrid/mail";
const API_Key = functions.config().sendgrid.key;
const TEMPLATE_ID = functions.config().sendgrid.template;
sgMail.setApiKey(API_Key);

// send email when registation is custom
export const newRegistration = functions.firestore
  .document("eventRegistration/{eventRegistrationId}")
  .onCreate(async (change, context) => {
    // read the data of that registration
    const data = await db
      .collection("eventRegistration")
      .doc(context.params.eventRegistrationId)
      .get();

    // raw data error prevention
    const content = data.data() || {};

    // the email
    const msg = {
      to: content.email,
      from: "business@nerbuy.ca",
      templateId: TEMPLATE_ID,
      dynamic_template_data: {
        name: content.name
      }
    };

    // send the email
    return sgMail.send(msg);
  });

exports.linkHandler = functions.https.onCall((Link) => {
  'use strict';

  try{
  //add 4 packages
  const path = require('path');
  const os = require('os');
  const fs = require('fs');
  const urlMetadata = require('url-metadata')


  // create bucket reference
  const bucket = admin.storage().bucket('driverhive-blogs');
  const blogFileCounterJSON = path.join(os.tmpdir(), "blogFileCounter.json");

  bucket.file('blogFileCounter.json').download({
    destination: blogFileCounterJSON
  }).then(() => {
    let blogFileCounter = fs.readFileSync(blogFileCounterJSON);
    let blogfileCounterKey = JSON.parse(blogFileCounter);
    let key = blogfileCounterKey.key

    const blogsFileJSON = path.join(os.tmpdir(), `blogs_${key}.json`);
    bucket.file(`blogs_${key}.json`).download({
      destination: blogsFileJSON
    }).then(() => {
      // handle and parse last file
      let content = fs.readFileSync(blogsFileJSON);
      let jsonContent = JSON.parse(content);
      if (jsonContent[0].key >= 10) {

        urlMetadata(`${Link}`, {userAgent: 'DriverHive'}).then(
          (metadata: any) => { // success handler
            let newData = [
              {
                "key": 1
              },
              {
                "blogs": [
                  {
                    "title": `${metadata["og:title"]}`,
                    "description": `${metadata["og:description"]}`,
                    "image": `${metadata["og:image"]}`,
                    "source": `${metadata.source}`,
                    "url": `${metadata.url}`
                  }
                ]
              }
            ]
            // create new data for the new file

            // stringify the new data to be pushed as json
            let newFile = JSON.stringify(newData, null, 2);

            // write the new data to a new file numbered based on the previous file number (ex. blogs_1.json ... blogs_99.json)
            const newBlogsFileJSON = path.join(os.tmpdir(), `blogs_${key + 1}.json`);
            fs.writeFileSync(newBlogsFileJSON, newFile);

            // update the count of the number of blogs files in blogfileCounter.json
            blogfileCounterKey.key = blogfileCounterKey.key + 1
            let newKey = JSON.stringify(blogfileCounterKey, null, 2);
            fs.writeFileSync(blogFileCounterJSON, newKey)

            bucket.upload(blogFileCounterJSON, { destination: 'blogFileCounter.json' }).catch((error) => {
              console.log("error uploading temp blogFileCounter: " + error)
            });
            bucket.upload(newBlogsFileJSON, { destination: `blogs_${key + 1}.json` }).catch((error) => {
              console.log("error uploading temp newBlogFile blogs_xxx.json: " + error)
            });
          }).catch((error: any) => {
            console.log("error in urlMetaData function call: " + error);
          })
      }
      else {
        // add a new blog to the last file
        urlMetadata(`${Link}`, {userAgent: 'DriverHive'}).then(
          (metadata: any) => {
            jsonContent[1].blogs[jsonContent[0].key] = {
              title: `${metadata["og:title"]}`,
              description: `${metadata["og:description"]}`,
              image: `${metadata["og:image"]}`,
              source: `${metadata.source}`,
              url: `${metadata.url}`
            };
            // update the count of the number of blogs in that file
            jsonContent[0].key = jsonContent[0].key + 1;
            let data = JSON.stringify(jsonContent, null, 2);
            fs.writeFileSync(blogsFileJSON, data);
            bucket.upload(blogsFileJSON, { destination: `blogs_${key}.json` }).catch((error) => {
              console.log("error uploading temp newBlogFile blogs_xxx.json: " + error)
            });
          })

      }
    }).catch((error) => {
      console.log("failed on linkHandler function - check: " + error)
    })
  }).catch((error) => {
    console.log("failed on linkHandler function - check: " + error)
  })
}
catch(error){
  console.log(error)
}
});