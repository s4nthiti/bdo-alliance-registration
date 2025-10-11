import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRegistrationCode(): string {
  // Generate a random 6-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getNextMonday(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // Sunday is 0, Monday is 1
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  return nextMonday.toISOString().split('T')[0];
}

export function generateDiscordMessage(guilds: Array<{name: string, registration_code: string, mercenary_quotas: number}>): string {
  let message = "🏰 **BDO Guild Boss Registration - Next Monday**\n\n";
  message += "Please share the following information with your guild members:\n\n";
  
  guilds.forEach((guild, index) => {
    message += `**${index + 1}. ${guild.name}**\n`;
    message += `📝 Registration Code: \`${guild.registration_code}\`\n`;
    message += `👥 Mercenary Quotas: **${guild.mercenary_quotas}**\n\n`;
  });
  
  message += "⚠️ **Instructions:**\n";
  message += "• Mercenaries should whisper the registration code in-game\n";
  message += "• Each guild has limited quotas - first come, first served\n";
  message += "• Boss fight is scheduled for Monday\n\n";
  message += "Good luck with the boss fight! 🎮";
  
  return message;
}

export function generateCustomMessage(
  template: string, 
  guilds: Array<{name: string, registration_code: string, mercenary_quotas: number}>,
  bossDate: string
): string {
  if (guilds.length === 0) {
    return template
      .replace(/{guildName}/g, 'No Guild')
      .replace(/{registrationCode}/g, 'N/A')
      .replace(/{mercenaryQuotas}/g, '0')
      .replace(/{bossDate}/g, bossDate);
  }

  // If template contains guild variables, generate message for each guild
  if (template.includes('{guildName}') || template.includes('{registrationCode}') || template.includes('{mercenaryQuotas}')) {
    let message = '';
    
    guilds.forEach((guild, index) => {
      let guildMessage = template
        .replace(/{guildName}/g, guild.name)
        .replace(/{registrationCode}/g, guild.registration_code)
        .replace(/{mercenaryQuotas}/g, guild.mercenary_quotas.toString())
        .replace(/{bossDate}/g, bossDate);
      
      if (index > 0) {
        message += '\n\n---\n\n';
      }
      message += guildMessage;
    });
    
    return message;
  }
  
  // If no guild variables, just replace boss date
  return template.replace(/{bossDate}/g, bossDate);
}
