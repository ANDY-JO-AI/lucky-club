// Default missions for Karaoke mode
import type { Mission } from '../types/game'

export const DEFAULT_MISSIONS_KARAOKE: {
  level1: Mission[]
  level2: Mission[]
  level3: Mission[]
} = {
  level1: [
    { id: 'k1-1', text_ko: '악수하고 5초 유지 🤝', text_en: 'Handshake and hold 5 seconds 🤝', text_vi: 'Bắt tay và giữ 5 giây 🤝', active: true },
    { id: 'k1-2', text_ko: '눈 마주치고 10초 버티기 👀', text_en: 'Eye contact for 10 seconds 👀', text_vi: 'Nhìn vào mắt nhau 10 giây 👀', active: true },
    { id: 'k1-3', text_ko: '손잡고 다음 순서까지 유지 💑', text_en: 'Hold hands until next turn 💑', text_vi: 'Nắm tay đến lượt tiếp theo 💑', active: true },
    { id: 'k1-4', text_ko: '귓속말로 칭찬 하나 하기 🫂', text_en: 'Whisper a compliment 🫂', text_vi: 'Thì thầm một lời khen 🫂', active: true },
    { id: 'k1-5', text_ko: '어깨에 손 올리기 🫱', text_en: 'Put hand on shoulder 🫱', text_vi: 'Đặt tay lên vai 🫱', active: true },
  ],
  level2: [
    { id: 'k2-1', text_ko: '5초 포옹 🫂', text_en: '5-second hug 🫂', text_vi: 'Ôm 5 giây 🫂', active: true },
    { id: 'k2-2', text_ko: '어깨 10초 마사지 💆', text_en: 'Shoulder massage 10 seconds 💆', text_vi: 'Massage vai 10 giây 💆', active: true },
    { id: 'k2-3', text_ko: '양손 잡고 눈 마주치기 🤲', text_en: 'Hold both hands and make eye contact 🤲', text_vi: 'Nắm hai tay và nhìn vào mắt 🤲', active: true },
    { id: 'k2-4', text_ko: '팔짱 끼고 건배 🥂', text_en: 'Link arms and toast 🥂', text_vi: 'Khóa tay và cụng ly 🥂', active: true },
    { id: 'k2-5', text_ko: '30초 같이 춤추기 💃', text_en: 'Dance together 30 seconds 💃', text_vi: 'Cùng nhảy 30 giây 💃', active: true },
  ],
  level3: [
    { id: 'k3-1', text_ko: '볼 뽀뽀 💋', text_en: 'Kiss on cheek 💋', text_vi: 'Hôn má 💋', active: true },
    { id: 'k3-2', text_ko: '이마 뽀뽀 😘', text_en: 'Kiss on forehead 😘', text_vi: 'Hôn trán 😘', active: true },
    { id: 'k3-3', text_ko: '목 뒤 10초 마사지 💆', text_en: 'Neck massage 10 seconds 💆', text_vi: 'Massage cổ 10 giây 💆', active: true },
    { id: 'k3-4', text_ko: '뒤에서 안아주기 10초 🤗', text_en: 'Back hug 10 seconds 🤗', text_vi: 'Ôm từ phía sau 10 giây 🤗', active: true },
    { id: 'k3-5', text_ko: '코 비비기 👃', text_en: 'Eskimo kiss 👃', text_vi: 'Cọ mũi 👃', active: true },
  ],
}
