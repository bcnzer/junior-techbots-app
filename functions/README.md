Junior Techbots functions
 
Note that I have the SendGrid key set as an environment variable. You can see it by typing `firebase functions:config:get`. 

You can clone this and other config using `firebase use staging` and then `firebase functions:config:clone --from junior-techbots`

To deploy `yarn run deploy`. You may want to set the environment to prod or staging first

Note that I manually created the `.runtimeconfig.json` by calling `firebase functions:config:get | ac .runtimeconfig.json`. This stored the JSON, which I have online, locally for use with the local emulator