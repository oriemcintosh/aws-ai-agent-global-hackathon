"use client"
import "@aws-amplify/ui-react/styles.css";
import "@/styles/amplify-overrides.css";
import {
  Authenticator,
  ThemeProvider,
  Theme,
  useTheme,
  View,
  useAuthenticator,
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

  function AuthInner({ children }: { children?: ReactNode }) {
    const { user } = useAuthenticator();
    if (!user) return null;
    return <>{children}</>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Authenticator>
        <AuthInner>{children}</AuthInner>
      </Authenticator>
    </ThemeProvider>
  );
}