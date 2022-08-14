import { createCanvas, loadImage } from "@napi-rs/canvas";

export interface UserData {
  username: string;
  discriminator: string;
  avatar: string;
  level: number;
}

interface LeaderboardData {
  width: number;
  height: number;
  margin: number;
  padding: number;
  background: string | Array<string>;
  overlay: string;
  medals: Array<string>;
  users?: Array<UserData>;
}

export class Leaderboard {
  private data: LeaderboardData;
  
  constructor() {
    this.data = {
      width: 960,
      height: 1270,
      margin: 25,
      padding: 15,
      background: "#23272A",
      overlay: "#333640",
      medals: ["#ffba57", "#9e9e9e", "#ce7430", "#4482c3", "#4482c3"]
    };
  }

  public setBackgroundColor(color: string | Array<string>) {
    this.data.background = color;
    return this;
  }

  public setOverlayColor(color: string) {
    this.data.overlay = color;
    return this;
  }

  public setUsers(users: Array<UserData>) {
    this.data.users = users;
    return this;
  }

  public setMedalColors(colors: Array<string>) {
    if(colors.length === 5) {
      this.data.medals = colors;
    }

    return this;
  }

  public async build(text?: { title?: string, level?: string }) {
    const { width, height, margin, padding, background, overlay, medals, users } = this.data;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    const yPoses: Array<number> = [];

    // Calculate y positions
    for(let i = 0; i < 5; i++) {
      yPoses.push(200 + margin * (i + 1) + 184 * i);
    }

    // Background
    if(typeof background === "string") {
      ctx.fillStyle = background;
    } else {
      const gradient = ctx.createLinearGradient(0, 0, width, height);

      for(let i = 0; i < background.length; i++) {
        gradient.addColorStop((i + 1) / background.length, background[i]);
      }
      ctx.fillStyle = gradient;
    }
    
    ctx.fillRect(0, 0, width, height);

    // Overlay
    ctx.fillStyle = overlay;
    for(const yPos of yPoses) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(margin, yPos);
      ctx.arcTo(width - margin, yPos, width - margin, yPos + 184, 30);
      ctx.arcTo(width - margin, yPos + 184, margin, yPos + 184, 30);
      ctx.arcTo(margin, yPos + 184, margin, yPos, 30);
      ctx.arcTo(margin, yPos, width - margin, yPos, 30);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Title
    ctx.textAlign = "center";
    ctx.font = "bold 135px MANROPE_BOLD";
    ctx.lineWidth = 4;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.fillText(text?.title ?? "Leaderboard", width / 2, 160);
    ctx.strokeText(text?.title ?? "Leaderboard", width / 2, 160);

    // Ranks
    const rankX = margin + padding;

    for(let i = 0; i < yPoses.length; i++) {
      const yPos = yPoses[i];
      const color = medals[i];

      ctx.fillStyle = color;
      ctx.strokeStyle = "#00000060";
      ctx.lineWidth = 20;
      ctx.save();
      ctx.beginPath();
      ctx.arc(rankX + 74, padding + yPos + 74, 55, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();


      ctx.textAlign = "center";
      ctx.font = "bold 80px MANROPE_BOLD";
      ctx.fillStyle = "#ffffffac";
      ctx.fillText(`${i + 1}`, margin + padding + 74, yPos + padding + 74 + 30);
    }

    // User data
    for(let i = 0; i < yPoses.length; i++) {
      const yPos = yPoses[i];
      const user = users?.shift();

      if(user) {
        const avatarX = rankX + 140 + padding;
        const nameX = avatarX + 100 + padding;
        const levelX = nameX + 385 + 30;
        // Username
        const name = (user.username.length > 13 ? user.username.substring(0, 13).trim() + "..." : user.username);

        ctx.textAlign = "start";
        ctx.font = "bold 40px MANROPE_BOLD";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(name, nameX, yPos + 92 + 18);

        // Discriminator
        ctx.font = "40px MANROPE_REGULAR";
        ctx.fillStyle = "#8f8f8f";
        ctx.fillText(`#${user.discriminator}`, nameX + ctx.measureText(name).width + 20, yPos + 92 + 18);

        // Level
        ctx.textAlign = "center";
        ctx.font = "bold 38px MANROPE_BOLD";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`${text?.level ?? "Level"} ${user.level}`, levelX + 92.5, yPos + 92 + 18);

        // Avatar
        const avatar = await loadImage(user.avatar);

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + 50, yPos + 92, 50, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, yPos + 42, 100, 100);
        ctx.restore();
      } else {
        ctx.textAlign = "start";
        ctx.font = "bold 50px MANROPE_BOLD";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("N/A", rankX + 140 + padding + 10, yPos + 92 + 18);
      }
    }

    return canvas.encode("png");
  }
}