# e2e testing with Cypress
Testing Junior Techbots required a bit of creativity around the logins (auth).

I wanted to use the emulator for everything. The minute I did so the firestore rules kicked in, which depended on the presence of a UID which you can only get if you're logged in. 

## Anonymous login
I've enabled this in staging.

I'm only using this to test the club creation, so that I can confirm it's the same club every time.

## Email & Password 
I'm using email and password every other time. That way I can have a consistent, pre-created club. 

The password I use is not stored in code. I put it in my system Environment Variables > User Variables