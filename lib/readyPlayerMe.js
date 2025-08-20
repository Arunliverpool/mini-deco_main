export class ReadyPlayerMe {
  constructor(subdomain = 'demo') {
    this.subdomain = subdomain;
    this.frameUrl = `https://${subdomain}.readyplayer.me/avatar?frameApi`;
  }

  // Generate 2D image from avatar URL
  generate2DImage(avatarUrl, options = {}) {
    const {
      scene = 'fullbody-portrait-v1-transparent',
      size = '512x512',
      format = 'png'
    } = options;

    return `https://render.readyplayer.me/render/${avatarUrl}.${format}?scene=${scene}&armature=ARP&pose=T&size=${size}`;
  }
}

export const rpm = new ReadyPlayerMe('demo');