/** Анимации и эффекты */

export const createParticles = (x: number, y: number, amount: number, text: string): HTMLElement[] => {
  const particles: HTMLElement[] = [];

  for (let i = 0; i < amount; i++) {
    const particle = document.createElement('div');
    particle.textContent = text;
    particle.style.cssText = `
      position: fixed;
      pointer-events: none;
      font-weight: bold;
      font-size: ${16 + Math.random() * 8}px;
      color: #fbbf24;
      text-shadow: 0 0 10px rgba(251, 191, 36, 0.8);
      z-index: 9999;
      left: ${x}px;
      top: ${y}px;
      transition: all 0.8s ease-out;
    `;

    document.body.appendChild(particle);

    const angle = (Math.random() * Math.PI * 2) / 2 - Math.PI / 4;
    const distance = 50 + Math.random() * 100;

    setTimeout(() => {
      particle.style.transform = `
        translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 100}px)
        scale(0)
      `;
      particle.style.opacity = '0';
    }, 10);

    setTimeout(() => {
      particle.remove();
    }, 800);

    particles.push(particle);
  }

  return particles;
};

export const createShakeEffect = (element: HTMLElement): void => {
  element.style.animation = 'shake 0.3s ease-in-out';
  setTimeout(() => {
    element.style.animation = '';
  }, 300);
};

export const createPulseEffect = (element: HTMLElement): void => {
  element.style.animation = 'pulse 0.2s ease-in-out';
  setTimeout(() => {
    element.style.animation = '';
  }, 200);
};

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info'): void => {
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  
  toast.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};
