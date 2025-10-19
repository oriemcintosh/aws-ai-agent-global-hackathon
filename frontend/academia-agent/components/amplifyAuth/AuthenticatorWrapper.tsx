"use client"

import {
  Authenticator,
  ThemeProvider,
  Theme,
  useTheme,
  View,
} from '@aws-amplify/ui-react';
import type { ReactNode } from 'react';

export default function AuthenticatorWrapper({ children }: { children?: ReactNode }) {
  const { tokens } = useTheme();
  const theme: Theme = {
    name: 'Auth Example Theme',
    tokens: {
      components: {
        authenticator: {
          router: {
            boxShadow: `0 0 16px ${tokens.colors.overlay['10']}`,
            borderWidth: '0',
          },
          form: {
            padding: `${tokens.space.medium} ${tokens.space.xl} ${tokens.space.medium}`,
          },
        },
        button: {
          primary: {
            backgroundColor: tokens.colors.neutral['100'],
          },
          link: {
            color: tokens.colors.blue['80'],
          },
        },
        fieldcontrol: {
          _focus: {
            boxShadow: `0 0 0 2px ${tokens.colors.blue['60']}`,
          },
        },
        tabs: {
          item: {
            color: tokens.colors.neutral['80'],
            _active: {
              borderColor: tokens.colors.neutral['100'],
              color: tokens.colors.neutral['100'],
            },
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* constrain width so the Authenticator doesn't stretch too wide on large screens */}
        <div className="w-full max-w-md">
          <ThemeProvider theme={theme}>
            <View padding="medium">
              <Authenticator
                // socialProviders={['amazon', 'apple', 'facebook', 'google']}
              >
                {() => <>{children}</>}
              </Authenticator>
            </View>
          </ThemeProvider>
        </div>
    </div>
  );
}