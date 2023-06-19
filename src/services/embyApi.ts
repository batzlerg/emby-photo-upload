export async function loginToEmby(username: string, password: string): Promise<string> {
  try {
    const embyBaseUrl = 'http://localhost:8096';

    // todo: pull userID from store and include in headers via wrapped Emby API requst helper / FE service method
    // Authenticate with the Emby server to obtain an access token
    const authUrl = `${embyBaseUrl}/emby/Users/AuthenticateByName`;
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Authorization': 'Emby Client="Login-testing", Device="testing", DeviceId="4567", Version="1234"'
      },
      body: JSON.stringify({
        Username: username,
        Pw: password,
      }),
    });

    if (!authResponse.ok) {
      throw new Error('Invalid username or password.');
    }

    const authData = await authResponse.json();

    return authData?.AccessToken;
  } catch (error) {
    throw new Error('Invalid username or password.');
  }
}

export async function uploadImageToEmby(imageFile: File, targetDirectoryId: string, accessToken: string) {
  try {
    const embyBaseUrl = 'http://your-emby-server-ip:8096';

    // Read the image file using FileReader
    const imageBuffer = await readFileAsArrayBuffer(imageFile);

    // Prepare the upload URL
    const uploadImageUrl = `${embyBaseUrl}/emby/Items/${targetDirectoryId}/Images?api_key=${accessToken}`;

    // Make a POST request to upload the image
    const uploadResponse = await fetch(uploadImageUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error('Image upload failed.');
    }
  } catch (error) {
    throw new Error('Error occurred during image upload.');
  }
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer.'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    reader.readAsArrayBuffer(file);
  });
}
