import { addDecorator } from '@storybook/react';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

let GoogleAuth;
var SCOPE = 'openid';
function  initClient() {
  // In practice, your app can retrieve one or more discovery documents.
  var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

  // Initialize the gapi.client object, which app uses to make API requests.
  // Get API key and client ID from API Console.
  // 'scope' field specifies space-delimited list of access scopes.
  gapi.client.init({
      'apiKey': 'AIzaSyD6NGU6n4j1eeSoNgaa-m30_jt_zWZ6B6A',
      'clientId': '767961718472-6tta2ghb1123bhkfvdcjsafr9oq6g7pa',
      'discoveryDocs': [discoveryUrl],
      'scope': SCOPE
  }).then(function () {
    GoogleAuth = gapi.auth2.getAuthInstance();

    if(!GoogleAuth?.isSignedIn.get()) {
      GoogleAuth.signIn();
    }
    // Listen for sign-in state changes.
    GoogleAuth.isSignedIn.listen(updateSigninStatus);

    // Handle initial sign-in state. (Determine if user is already signed in.)
    const user = GoogleAuth.currentUser.get();
    const userDiv = document.getElementById("storybook-user-details");
    if (userDiv) {
      userDiv.innerHTML = buildUserDetailsStr(user);
      const signoutBtn = document.getElementById("sign-out-button");
      signoutBtn.addEventListener("click", signOut);
    }
    setSigninStatus();

    $('#revoke-access-button').click(function() {
      revokeAccess();
    });
  });
  return GoogleAuth;
}

function revokeAccess() {
  GoogleAuth.disconnect();
}

function setSigninStatus() {
  var user = GoogleAuth.currentUser.get();
  var isAuthorized = user.hasGrantedScopes(SCOPE);
  if (isAuthorized) {
    $('#sign-in-or-out-button').html('Sign out');
    $('#revoke-access-button').css('display', 'inline-block');
    $('#auth-status').html('You are currently signed in and have granted ' +
        'access to this app.');
  } else {
    $('#sign-in-or-out-button').html('Sign In/Authorize');
    $('#revoke-access-button').css('display', 'none');
    $('#auth-status').html('You have not authorized this app or you are ' +
        'signed out.');
  }
}

function updateSigninStatus() {
  setSigninStatus();
  window.location.reload();
}

function signOut() {
  GoogleAuth.signOut(); window.location.reload()
}
function buildUserDetailsStr (user){
  if(user)
    return `<div>Hello ${user.getBasicProfile().getName()} <button id='sign-out-button'>Sign Out</button></div>`
  else 
    return `<div></div>`
}

function buildUserDetails (user){
  if(user && user.getBasicProfile())
    return <div>Hello {user.getBasicProfile().getName()} <button onClick={()=>{signOut()}}>Sign Out</button></div>
  else 
    return <div></div>
}
const AppDecorator = (storyFn) => {
    let user;
    if(GoogleAuth && GoogleAuth.currentUser){
      user = GoogleAuth.currentUser.get();
    }
    const userDiv = buildUserDetails(user)
    return (
      <div>
        <div id="storybook-user-details">{ userDiv }</div>
        <div>{ storyFn()}</div>
        
      </div>
    )

}


addDecorator(AppDecorator);

gapi.load('client:auth2', _ => {
  initClient();
})
