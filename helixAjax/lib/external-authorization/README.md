

# EXTERNAL AUTHORIZATION FOR hxCONNECTOR

**INTRODUCTION**

Until recently, hxConnector (hxc) allowed access based on the posession of an api access key. Posession of this key granted access to certain capabilities in Helix specified by hxc endpoints. 

hxc now has two additional capabilities.

First, it can specify a pair of headers, hxuser and hxpassword, that refer to the Helix Server internal login system. If these are specified and they are incorrect, an error is thrown and access is denied.

Second, it can specify a pair of headers, externalu and externalp, that refer to some external authentication system. If, when hxc asks, that system denies access, then an error is thrown and access is denied.

The purpose of this latter is to allow central administration of access to Helix data, eg, when an employee leaves.

**HELIX AUTHORIZATION**

If hxuser and hxpassword are supplied, regardless of other settings, hxc will attempt to login with these parameters. Even if external authorization passes, access to data will be denied.

This allows users to use applications with their familiar Helix credentials.

**EXTERNAL AUTHORIZATION**

An element, external-authorization, is defined for the hxc configuration file, systemParameters.ini. It has three sections...

isActive
useCredentialsForHelix
verificationModuleName

and a last section with the same name as the value of verificationModuleName.

EG,

```[external-authorization]
isActive=true
useCredentialsForHelix=false

verificationModuleName=ask-active-directory
ask-active-directory.TENANT_ID=********-****-****-****-************
ask-active-directory.CLIENT_ID=********-****-****-****-************
ask-active-directory.CLIENT_SECRET=*****~**-*******.********************
ask-active-directory.AAD_ENDPOINT=https://login.microsoftonline.com/
ask-active-directory.GRAPH_ENDPOINT=https://graph.microsoft.com/
```

**CONTROLLING AUTHORIZATION**

**isActive is false; hx header properties are _not_ defined**

This is the backward compatibility mode. With an API key, a session (pool user) will be establised and any access specified by endpoints will be executed.


**isActive is false; hx header properties _are_ defined**

hxc will try to log in with the credentials specified in the header. Access will only be allowed if Helix finds them valid.

**isActive is true; hx header properties are _not_ defined**

hxc will access the external identity source. If the user is validated, hxc will generate a session (user pool) and execute any valid data access.


**isActive is true; hx header properties _are_ defined**

*(This is not an expected use case. It could be useful in the future if a Helix application had a reason to know the identity of the accessor. Presently this is never the case.)*

Access will only be allowed if both the external identity source and Helix approve the user.

**isActive is true; useCredentialsForHelix is true**

*(This is mostly a testing/development function.)*

hxc will, if the credentials are validated by the external identity source, copy those into hxuser and hxpassword header elements. Those will be used to log into Helix and, if not accepted, an error will be thrown.

