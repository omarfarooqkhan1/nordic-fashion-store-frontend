import React from 'react';
import { Instagram, Youtube, Twitter, Facebook } from 'lucide-react';

interface SocialMediaIconsProps {
  className?: string;
  iconSize?: number;
  showLabels?: boolean;
}

const socialMediaLinks = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/nordflex.official',
    icon: Instagram,
    color: 'hover:text-pink-500',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@NordFlex',
    icon: Youtube,
    color: 'hover:text-red-500',
  },
  {
    name: 'X (Twitter)',
    url: 'https://www.x.com/@NordFlex',
    icon: Twitter,
    color: 'hover:text-blue-400',
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@nordflex',
    icon: () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.66-1.44v5.58a6.84 6.84 0 0 1-6.84 6.84h-.06a6.84 6.84 0 0 1-6.84-6.84 6.84 6.84 0 0 1 6.84-6.84h.06a6.84 6.84 0 0 1 6.84 6.84v1.22a2.44 2.44 0 0 0-2.44-2.44 2.44 2.44 0 0 0-2.44 2.44 2.44 2.44 0 0 0 2.44 2.44 2.44 2.44 0 0 0 2.44-2.44V2.5h2.44a4.83 4.83 0 0 1 3.66 1.44z"/>
      </svg>
    ),
    color: 'hover:text-black dark:hover:text-white',
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/nord.flex',
    icon: Facebook,
    color: 'hover:text-blue-600',
  },
  {
    name: 'Pinterest',
    url: 'https://www.pinterest.com/nordflexshop',
    icon: () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path d="M12 0C5.373 0 0 5.372 0 12 0 17.084 3.163 21.426 7.627 23.174c-.105-.949-.2-2.405.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.562-5.418 5.207 0 1.031.397 2.138.893 2.738a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.223-.334.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.292-1.155l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    ),
    color: 'hover:text-red-600',
  },
];

export const SocialMediaIcons: React.FC<SocialMediaIconsProps> = ({
  className = '',
  iconSize = 24,
  showLabels = false,
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {socialMediaLinks.map((social) => {
        const IconComponent = social.icon;
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-muted-foreground transition-all duration-200 ${social.color} group hover:scale-110 transform`}
            aria-label={`Follow us on ${social.name}`}
            title={`Follow us on ${social.name}`}
          >
            <div className="flex items-center space-x-2 p-1 rounded-md hover:bg-muted/50 transition-colors">
              <IconComponent size={iconSize} />
              {showLabels && (
                <span className="text-sm font-medium group-hover:text-current">
                  {social.name}
                </span>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default SocialMediaIcons;
