# Google Drive Cluestr Provider
> Visit http://cluestr.com for details about Cluestr.

Cluestr provider for files stored in Google Drive

# How to install?
Vagrant up everything (`vagrant up`, `vagrant ssh`).

You'll need to define some environment variables

```bash
# Go to https://cloud.google.com/console#/flows/enableapi?apiid=drive to ask for app id and secret
export GDRIVE_ID="gdrive-id"
export GDRIVE_SECRET="gdrive-secret"

# Callback after gdrive consent, most probably https://your-host/init/callback
export GDRIVE_CALLBACK_URL="callback-after-gdrive-consent"

# Cluestr app id and secret
export GDRIVE_CLUESTR_ID="cluestr-app-id"
export GDRIVE_CLUESTR_SECRET="cluestr-app-secret"

# Number of files to upload at the same time
export GDRIVE_MAX_CONCURRENCY="5"

# See below for details
export GDRIVE_TEST_OAUTH_TOKEN_SECRET=""
export GDRIVE_TEST_OAUTH_TOKEN=""
export GDRIVE_TEST_UID=""
# Leave empty for first run
export GDRIVE_TEST_CURSOR=""
```

# How does it works?
Cluestr Core will call `/init/connect` with cluestr authorization code. We will generate a request_token and transparently redirect the user to gdrive consentment page.
gdrive will then call us back on `/init/callback`. We'll check our request_token has been granted approval, and store this.

We can now sync datas between gdrive and Cluestr.

This is where the `upload` helper comes into play.
Every time `upload` is called, the function will retrieve, for all the accounts, the files modified since the last run, and upload the datas to Cluestr.
Deleted files will also be deleted from Cluestr.

The computation of the delta (between last run and now) or by push is done by gdrive, and can be really long in some rare cases (for most accounts it is a few seconds, on mine it lasts for 25 minutes -- heavy gdrive users beware! And that says nothing about the time to retrieve the datas after.)

# How to test?
Unfortunately, testing this module is really hard.
This project is basically a simple bridge between gdrive and Cluestr, so testing requires tiptoeing with the network and gdrive / Cluestr servers.

Before running the test suite, you'll need to do:

```
> node test-auth.js
```

Follow the link in your browser with your gdrive.
After that, press enter and copy the result in your shell, then. Save the values as GDRIVE_TEST_* environment variable.

> *Advanced users*: keep `GDRIVE_TEST_CURSOR` empty by default. If you want to make the tests run faster, `console.log` the return of a call to `helpers.retrieve.delta()` and paste the `cursor` value.

Support: `support@papiel.fr`.
