import { renderCharacterCreation } from "../src/ui/characterCreation.js";
import { saveProfile } from "../src/services/characterProfile.js";

const mount = document.querySelector("#character-creation-root");
const message = document.querySelector("#demo-message");

renderCharacterCreation(mount, {
  initialDraft: {
    name: "",
    town: "",
    founderPathId: "",
    professionId: ""
  },
  onComplete(profile) {
    saveProfile(profile);
    message.hidden = false;
    message.innerHTML = `Profile saved locally for <strong>${profile.identity.name}</strong>. Open DevTools → Application → Local Storage to inspect <code>republic-builder-profile</code>.`;
    message.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});
