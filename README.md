## Deploy Express.js to Azure Web App Using GitHub OIDC (Passwordless Deployment)

This guide explains how to deploy a Node.js/Express application to Azure Web App using GitHub Actions + OIDC Federated Identity (no publish profile, no secrets, no passwords).

This is the modern Azure-recommended deployment method for secure CI/CD.


[Know more about OIDC](https://auth0.com/intro-to-iam/what-is-openid-connect-oidc)


What are the benefits of OIDC ?

- No publish profile
- No GitHub secrets containing passwords
- No Service Principal secrets
- Secure passwordless deployments
- GitHub is trusted using a Federated Credential
- Azure grants temporary access tokens to GitHub Actions


### Some prerequisites you should have

- Azure Subscription
- Github repository containing Express App
- Azure CLI Installed (this can be optional as here we are using GUI)


 

### 🎥 Video Walkthrough

[Click here to watch the video](https://allyworkspace.blob.core.windows.net/images/oidc-express.mp4)




## Steps 


1. Create a new Resource Group or you can use any existing one


2. Next create web app service inside that resource group.
use RUNTIME as `NODE:20-lts`


3. Create an APP registration for OIDC

Navigate to Home page of Azure portal then search `Microsoft ENTRA ID` and inside APP Registration create a NEW Registration

I have used the following values

Name: github-oidc-deployer
Supported Account Type : Single Tenant
Redirect URI : None

**Register** it

Once created, copy the following values

- Client ID
- Tenant ID
- Subscription ID(from subscription page)



4. Add a federated Credential

In app registration go the app you created, Inside it navigate to client secrets Tab


Set the values in proper way

Identity Provider - Github Actions

Entity Type - Repository

Organization - Github username

Repository - repository name

Branch - main

Name - github-oidc-main


Now add these values


5. Assigning RBAC Role to App registration


- Navigate to resource group where you created web app and then go inside IAM
- Now click on role assignment


Role - contributor

Assign access - User,group or service principal

Search for your app registration

Save it


6. Now add the below github secrets in your repository

Navigate to Settings -> Secrets and variables -> actions -> create new repository secrets

```bash
AZURE_CLIENT_ID
AZURE_TENANT_ID
AZURE_SUBSCRIPTION_ID
WEBAPP_NAME  (your Azure Web App name)
RESOURCE_GROUP (your RG name)
```

7. Now add the below github workflow file


create the file `.github/workflows/deploy.yml`


```bash
name: Deploy Node.js App to Azure Web App using OIDC

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20.x"

      - name: Install dependencies
        run: npm install

      - name: Build (optional)
        run: npm run build --if-present

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: .

  deploy:
    runs-on: ubuntu-latest
    needs: build

    permissions:
      id-token: write
      contents: read

    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: node-app

      - name: Login to Azure using OIDC
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ secrets.WEBAPP_NAME }}
          package: .
```

Now just commit and push the code


GitHub Actions will:

- Request an OIDC token

- Azure validates the identity

- Azure grants a temporary token

- Deployment runs securely
