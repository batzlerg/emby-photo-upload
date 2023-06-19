<script>
  import { createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";
  import { loginToEmby, uploadImageToEmby } from "./services/embyApi";

  let file;
  let targetDirectoryId = "your-target-directory-id";
  let progress = 0;
  let error = "";
  let success = "";

  // Create a writable store to hold the access token
  const accessTokenStore = writable("");
  console.log($accessTokenStore);

  const dispatch = createEventDispatcher();

  let username = "";
  let password = "";

  async function handleLogin() {
    try {
      // Authenticate with the Emby server to obtain an access token
      const accessToken = await loginToEmby(username, password);
      accessTokenStore.set(accessToken);
    } catch (err) {
      error = "Invalid username or password.";
    }
  }

  async function handleUpload() {
    if (file) {
      try {
        progress = 0;
        error = "";
        success = "";

        const progressInterval = setInterval(() => {
          progress = progress + 10;
          if (progress >= 100) {
            clearInterval(progressInterval);
          }
        }, 500);

        const accessToken = $accessTokenStore; // Access the access token from the store
        await uploadImageToEmby(file, targetDirectoryId, accessToken);

        progress = 100;
        success = "Image upload successful!";
        dispatch("uploaded");
      } catch (err) {
        progress = 0;
        error = "Error occurred during image upload.";
      }
    }
  }

  function handleFileInputChange(event) {
    file = event.target.files[0];
  }
</script>

<main>
  {#if !$accessTokenStore}
    <div>
      <input type="text" placeholder="Username" bind:value={username} />
      <input type="password" placeholder="Password" bind:value={password} />
      <button on:click={handleLogin}>Login</button>
      {#if error}
        <p>{error}</p>
      {/if}
    </div>
  {:else}
    <h1>Image Upload</h1>
    <input type="file" accept="image/*" on:change={handleFileInputChange} />

    {#if progress > 0 && progress < 100}
      <div>
        <progress value={progress} max="100" />
      </div>
    {/if}

    {#if error}
      <div>
        <p>{error}</p>
      </div>
    {/if}

    {#if success}
      <div>
        <p>{success}</p>
      </div>
    {/if}

    <button on:click={handleUpload} disabled={!file}>Upload</button>
  {/if}
</main>
