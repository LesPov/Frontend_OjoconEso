// utils/headers/bot-utils.ts

import { BotInfoService } from "../../../shared/bot/botInfoDenuncias";


export function handleSpeak(
    botInfoService: BotInfoService,
    isSpeaking: boolean,
    toggleSpeakingAnimation: (isSpeaking: boolean) => void,
    activatePulseAnimation: () => void
): Promise<void> {
    const iconElement = document.querySelector('.bx-user-voice');

    if (isSpeaking) {
        botInfoService.cancelSpeak();
        toggleSpeakingAnimation(false);
        iconElement?.classList.remove('speaking-active');
        activatePulseAnimation();
        return Promise.resolve();
    } else {
        const nextInfo = botInfoService.getNextInfo();
        toggleSpeakingAnimation(true);
        iconElement?.classList.add('speaking-active');

        return botInfoService.speak(nextInfo)
            .then(() => {
                toggleSpeakingAnimation(false);
                iconElement?.classList.remove('speaking-active');
                activatePulseAnimation();
            })
            .catch((error) => {
                console.error('Error al hablar:', error);
                toggleSpeakingAnimation(false);
                iconElement?.classList.remove('speaking-active');
                activatePulseAnimation();
            });
    }
}
