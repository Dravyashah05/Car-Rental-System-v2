import { SignIn } from "@clerk/react";
import { useTheme } from "../context/ThemeContext";
import '../styles/AuthPage.css';

const LoginPage = () => {
  const { theme } = useTheme();

  return (
    <div className="auth-page auth-page--login">
      <div className="auth-form-container">
        <div className="auth-shell">
          <div className="auth-card--clerk">
            <SignIn 
              appearance={{
                variables: {
                  colorPrimary: '#ff8367',
                  colorBackground: theme === 'dark' ? '#0c1628' : '#ffffff',
                  colorText: theme === 'dark' ? '#f5f7ff' : '#0f172a',
                  colorTextSecondary: theme === 'dark' ? '#a9bedf' : '#64748b',
                  colorInputBackground: 'transparent',
                  colorInputText: theme === 'dark' ? '#f5f7ff' : '#0f172a',
                  borderRadius: '14px',
                },
                layout: {
                  socialButtonsPlacement: 'top',
                  showOptionalFields: false,
                },
                elements: {
                  rootBox: "cl-rootBox",
                  card: "cl-card",
                  headerTitle: "cl-headerTitle",
                  headerSubtitle: "cl-headerSubtitle",
                  formButtonPrimary: "cl-formButtonPrimary",
                  formFieldInput: "cl-formFieldInput",
                  socialButtonsBlockButton: "cl-socialButtonsBlockButton",
                  dividerLine: "cl-dividerLine",
                  footerActionLink: "cl-footerActionLink",
                }
              }}
              routing="path"
              path="/login"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
