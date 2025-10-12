export type Language = 'en' | 'th';

export interface Translations {
  // Common
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    confirm: string;
    copy: string;
    download: string;
    yes: string;
    no: string;
  };
  
  // Auth
  auth: {
    title: string;
    subtitle: string;
    username: string;
    password: string;
    login: string;
    loggingIn: string;
    invalidCredentials: string;
    loginFailed: string;
    defaultCredentials: string;
    logout: string;
    welcome: string;
  };
  
  // Guild Management
  guilds: {
    title: string;
    subtitle: string;
    addGuild: string;
    editGuild: string;
    deleteGuild: string;
    guildName: string;
    registrationCode: string;
    mercenaryQuotas: string;
    contactInfo: string;
    generateCode: string;
    noGuilds: string;
    noGuildsSubtitle: string;
      deleteConfirm: string;
      deleteConfirmMessage: string;
      nameRequired: string;
      codeRequired: string;
      codeTooLong: string;
      quotasRequired: string;
      quotasPositive: string;
  };
  
  // Message Generator
    message: {
      title: string;
      subtitle: string;
      noGuildsAvailable: string;
      noGuildsSubtitle: string;
      nextBoss: string;
      copyMessage: string;
      copied: string;
      downloadText: string;
      tip: string;
      tipMessage: string;
      selectGuilds: string;
      selectedGuilds: string;
      allGuilds: string;
      noGuildsSelected: string;
      selectAll: string;
      deselectAll: string;
      messageTemplate: string;
      editTemplate: string;
      saveTemplate: string;
      resetTemplate: string;
      templateVariables: string;
      templateHelp: string;
      templateHelpText: string;
      defaultTemplate: string;
    };
  
  // Quota Tracker
  tracker: {
    title: string;
    subtitle: string;
    bossDate: string;
    usedQuotas: string;
    availableQuotas: string;
    totalQuotas: string;
    noRegistrations: string;
    noRegistrationsSubtitle: string;
    initializeRegistrations: string;
    quotaLimit: string;
    quotaLimitMessage: string;
    instructions: string;
    instructionsMessage: string;
    selectGuilds: string;
    selectedGuilds: string;
    allGuilds: string;
    noGuildsSelected: string;
  };
  
  // Navigation
  nav: {
    guildManagement: string;
    messageGenerator: string;
    quotaTracker: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      confirm: 'Confirm',
      copy: 'Copy',
      download: 'Download',
      yes: 'Yes',
      no: 'No',
    },
    auth: {
      title: 'BDO Guild Management',
      subtitle: 'Sign in to manage your guild boss registrations',
      username: 'Username',
      password: 'Password',
      login: 'Sign in',
      loggingIn: 'Signing in...',
      invalidCredentials: 'Invalid username or password',
      loginFailed: 'Login failed. Please try again.',
      defaultCredentials: 'by AmaneP',
      logout: 'Logout',
      welcome: 'Welcome',
    },
    guilds: {
      title: 'Guild Management',
      subtitle: 'Manage your alliance guilds and their registration codes',
      addGuild: 'Add Guild',
      editGuild: 'Edit Guild',
      deleteGuild: 'Delete Guild',
      guildName: 'Guild Name',
      registrationCode: 'Registration Code',
      mercenaryQuotas: 'Mercenary Quotas',
      contactInfo: 'Contact Information',
      generateCode: 'Generate',
      noGuilds: 'No guilds',
      noGuildsSubtitle: 'Get started by adding your first guild.',
      deleteConfirm: 'Are you sure you want to delete this guild? This action cannot be undone.',
      deleteConfirmMessage: 'Are you sure you want to delete this guild? This action cannot be undone.',
      nameRequired: 'Guild name is required',
      codeRequired: 'Registration code is required',
      codeTooLong: 'Registration code is too long (max 100 characters)',
      quotasRequired: 'Mercenary quotas must be a positive number',
      quotasPositive: 'Mercenary quotas must be a positive number',
    },
    message: {
      title: 'Message Generator',
      subtitle: 'Generate Discord messages for guild registration',
      noGuildsAvailable: 'No guilds available',
      noGuildsSubtitle: 'Add some guilds first to generate the Discord message.',
      nextBoss: 'Next Boss',
      copyMessage: 'Copy Message',
      copied: 'Copied!',
      downloadText: 'Download as Text',
      tip: 'Tip',
      tipMessage: 'Copy this message and send it to each guild\'s Discord channel or contact person. The message contains all the necessary information for mercenaries to register for the boss fight.',
      selectGuilds: 'Select Guilds',
      selectedGuilds: 'Selected Guilds',
      allGuilds: 'All Guilds',
      noGuildsSelected: 'No guilds selected',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      messageTemplate: 'Message Template',
      editTemplate: 'Edit Template',
      saveTemplate: 'Save Template',
      resetTemplate: 'Reset to Default',
      templateVariables: 'Template Variables',
      templateHelp: 'Template Help',
      templateHelpText: 'Use these variables in your template: {guildName}, {registrationCode}, {mercenaryQuotas}, {bossDate}. Each guild will be processed separately.',
      defaultTemplate: 'Default Template',
    },
    tracker: {
      title: 'Quota Tracker',
      subtitle: 'Track mercenary registrations for the boss fight',
      bossDate: 'Boss Date',
      usedQuotas: 'Used Quotas',
      availableQuotas: 'Available Quotas',
      totalQuotas: 'Total Quotas',
      noRegistrations: 'No registrations found',
      noRegistrationsSubtitle: 'Initialize registrations for the next boss fight.',
      initializeRegistrations: 'Initialize Registrations',
      quotaLimit: 'This guild has reached its quota limit',
      quotaLimitMessage: '⚠️ This guild has reached its quota limit',
      instructions: 'Instructions',
      instructionsMessage: 'Use the + and - buttons to track how many mercenaries have registered for each guild. This helps you monitor quota usage during the boss fight.',
      selectGuilds: 'Select Guilds',
      selectedGuilds: 'Selected Guilds',
      allGuilds: 'All Guilds',
      noGuildsSelected: 'No guilds selected',
    },
    nav: {
      guildManagement: 'Guild Management',
      messageGenerator: 'Message Generator',
      quotaTracker: 'Quota Tracker',
    },
  },
  th: {
    common: {
      loading: 'กำลังโหลด...',
      save: 'บันทึก',
      cancel: 'ยกเลิก',
      delete: 'ลบ',
      edit: 'แก้ไข',
      add: 'เพิ่ม',
      close: 'ปิด',
      confirm: 'ยืนยัน',
      copy: 'คัดลอก',
      download: 'ดาวน์โหลด',
      yes: 'ใช่',
      no: 'ไม่',
    },
    auth: {
      title: 'ระบบจัดการกิลด์ BDO',
      subtitle: 'เข้าสู่ระบบเพื่อจัดการการลงทะเบียนบอสกิลด์',
      username: 'ชื่อผู้ใช้',
      password: 'รหัสผ่าน',
      login: 'เข้าสู่ระบบ',
      loggingIn: 'กำลังเข้าสู่ระบบ...',
      invalidCredentials: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      loginFailed: 'เข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง',
      defaultCredentials: 'by AmaneP',
      logout: 'ออกจากระบบ',
      welcome: 'ยินดีต้อนรับ',
    },
    guilds: {
      title: 'จัดการกิลด์',
      subtitle: 'จัดการกิลด์พันธมิตรและรหัสลงทะเบียน',
      addGuild: 'เพิ่มกิลด์',
      editGuild: 'แก้ไขกิลด์',
      deleteGuild: 'ลบกิลด์',
      guildName: 'ชื่อกิลด์',
      registrationCode: 'รหัสลงทะเบียน',
      mercenaryQuotas: 'โควต้าเมอร์ซินารี่',
      contactInfo: 'ข้อมูลติดต่อ',
      generateCode: 'สร้างรหัส',
      noGuilds: 'ไม่มีกิลด์',
      noGuildsSubtitle: 'เริ่มต้นด้วยการเพิ่มกิลด์แรกของคุณ',
      deleteConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบกิลด์นี้? การกระทำนี้ไม่สามารถยกเลิกได้',
      deleteConfirmMessage: 'คุณแน่ใจหรือไม่ว่าต้องการลบกิลด์นี้? การกระทำนี้ไม่สามารถยกเลิกได้',
      nameRequired: 'ต้องระบุชื่อกิลด์',
      codeRequired: 'ต้องระบุรหัสลงทะเบียน',
      codeTooLong: 'รหัสลงทะเบียนยาวเกินไป (สูงสุด 100 ตัวอักษร)',
      quotasRequired: 'โควต้าเมอร์ซินารี่ต้องเป็นตัวเลขบวก',
      quotasPositive: 'โควต้าเมอร์ซินารี่ต้องเป็นตัวเลขบวก',
    },
    message: {
      title: 'เครื่องมือสร้างข้อความ',
      subtitle: 'สร้างข้อความ Discord สำหรับการลงทะเบียนกิลด์',
      noGuildsAvailable: 'ไม่มีกิลด์ที่พร้อมใช้งาน',
      noGuildsSubtitle: 'เพิ่มกิลด์ก่อนเพื่อสร้างข้อความ Discord',
      nextBoss: 'บอสครั้งต่อไป',
      copyMessage: 'คัดลอกข้อความ',
      copied: 'คัดลอกแล้ว!',
      downloadText: 'ดาวน์โหลดเป็นไฟล์ข้อความ',
      tip: 'เคล็ดลับ',
      tipMessage: 'คัดลอกข้อความนี้และส่งไปยังช่อง Discord ของแต่ละกิลด์หรือผู้ติดต่อ ข้อความมีข้อมูลที่จำเป็นทั้งหมดสำหรับเมอร์ซินารี่ในการลงทะเบียนสำหรับการต่อสู้บอส',
      selectGuilds: 'เลือกกิลด์',
      selectedGuilds: 'กิลด์ที่เลือก',
      allGuilds: 'กิลด์ทั้งหมด',
      noGuildsSelected: 'ไม่ได้เลือกกิลด์',
      selectAll: 'เลือกทั้งหมด',
      deselectAll: 'ยกเลิกการเลือกทั้งหมด',
      messageTemplate: 'แม่แบบข้อความ',
      editTemplate: 'แก้ไขแม่แบบ',
      saveTemplate: 'บันทึกแม่แบบ',
      resetTemplate: 'รีเซ็ตเป็นค่าเริ่มต้น',
      templateVariables: 'ตัวแปรแม่แบบ',
      templateHelp: 'ความช่วยเหลือแม่แบบ',
      templateHelpText: 'ใช้ตัวแปรเหล่านี้ในแม่แบบของคุณ: {guildName}, {registrationCode}, {mercenaryQuotas}, {bossDate}. แต่ละกิลด์จะถูกประมวลผลแยกกัน',
      defaultTemplate: 'แม่แบบเริ่มต้น',
    },
    tracker: {
      title: 'ติดตามโควต้า',
      subtitle: 'ติดตามการลงทะเบียนเมอร์ซินารี่สำหรับการต่อสู้บอส',
      bossDate: 'วันที่บอส',
      usedQuotas: 'โควต้าที่ใช้แล้ว',
      availableQuotas: 'โควต้าที่เหลือ',
      totalQuotas: 'โควต้าทั้งหมด',
      noRegistrations: 'ไม่พบการลงทะเบียน',
      noRegistrationsSubtitle: 'เริ่มต้นการลงทะเบียนสำหรับการต่อสู้บอสครั้งต่อไป',
      initializeRegistrations: 'เริ่มต้นการลงทะเบียน',
      quotaLimit: 'กิลด์นี้ถึงขีดจำกัดโควต้าแล้ว',
      quotaLimitMessage: '⚠️ กิลด์นี้ถึงขีดจำกัดโควต้าแล้ว',
      instructions: 'คำแนะนำ',
      instructionsMessage: 'ใช้ปุ่ม + และ - เพื่อติดตามจำนวนเมอร์ซินารี่ที่ลงทะเบียนสำหรับแต่ละกิลด์ สิ่งนี้ช่วยให้คุณติดตามการใช้โควต้าในระหว่างการต่อสู้บอส',
      selectGuilds: 'เลือกกิลด์',
      selectedGuilds: 'กิลด์ที่เลือก',
      allGuilds: 'กิลด์ทั้งหมด',
      noGuildsSelected: 'ไม่ได้เลือกกิลด์',
    },
    nav: {
      guildManagement: 'จัดการกิลด์',
      messageGenerator: 'เครื่องมือสร้างข้อความ',
      quotaTracker: 'ติดตามโควต้า',
    },
  },
};
