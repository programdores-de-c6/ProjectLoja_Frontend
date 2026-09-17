/**
 * ====================================================
 * PÁGINA DE LOGIN
 * LOGIN + RECUPERAÇÃO + PRIMEIRO ACESSO
 * ====================================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// Componentes UI
import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Loader2,
  User,
  Lock,
  Eye,
  EyeOff,
  Mail,
  KeyRound,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

// Contexto e configurações
import { useAuth } from '@/contexts/useAuth';

import {
  showSuccessToast,
  showErrorToast
} from '@/utils/toast';

import api from '@/config/api';

// ====================================================
// INTERFACES
// ====================================================

interface TokenPayload {
  id: number;
  NivelAcesso: string;
  nome: string;
  loja?: string;
  lojaid?: number;
  email: string;
  exp: number;
}

interface ShopResponse {
  logoUrl?: string | null;
}

// ====================================================
// VISTAS
// ====================================================

type AuthView =
  | 'login'
  | 'first-password'
  | 'forgot-email'
  | 'forgot-reset';

// ====================================================
// ESQUEMA DE VALIDAÇÃO DO LOGIN
// ====================================================

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email ou Username é obrigatório'),

  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ====================================================
// COMPONENTE
// ====================================================

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ==================================================
  // ESTADOS GERAIS
  // ==================================================

  const [authView, setAuthView] =
    useState<AuthView>('login');

  const [isLoading, setIsLoading] =
    useState(false);

  // ==================================================
  // ESTADOS DO LOGIN
  // ==================================================

  const [showPassword, setShowPassword] =
    useState(false);

  // ==================================================
  // ESTADOS DO PRIMEIRO ACESSO
  // ==================================================

  const [firstLoginPassword, setFirstLoginPassword] =
    useState('');

  const [firstLoginConfirmPassword, setFirstLoginConfirmPassword] =
    useState('');

  const [showFirstLoginPassword, setShowFirstLoginPassword] =
    useState(false);

  const [showFirstLoginConfirmPassword, setShowFirstLoginConfirmPassword] =
    useState(false);

  const [firstLoginLoading, setFirstLoginLoading] =
    useState(false);

  const [firstLoginIsAdminGlobal, setFirstLoginIsAdminGlobal] =
    useState(false);

  // ==================================================
  // ESTADOS DA RECUPERAÇÃO
  // ==================================================

  const [recoveryEmail, setRecoveryEmail] =
    useState('');

  const [recoveryCode, setRecoveryCode] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [recoveryLoading, setRecoveryLoading] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ==================================================
  // REACT HOOK FORM
  // ==================================================

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = async (
    data: LoginFormData
  ) => {
    setIsLoading(true);

    try {
      // 1. Enviar credenciais
      const response = await api.post(
        '/employee/login',
        {
          email: data.identifier,
          senha: data.password,
        }
      );

      const {
        accessToken,
        firstLogin
      } = response.data;

      if (!accessToken) {
        throw new Error(
          'Token de acesso não recebido.'
        );
      }

      // 2. Decodificar JWT
      const decoded =
        jwtDecode<TokenPayload>(accessToken);

      // 3. Buscar logo da loja
      let shopData: ShopResponse = {};

      if (decoded.lojaid) {
        try {
          const shopResponse =
            await api.post<ShopResponse>(
              '/shop/fetch',
              {
                id: decoded.lojaid,
              }
            );

          shopData = shopResponse.data;

        } catch (err) {
          // A falha do logo não impede o login
          shopData.logoUrl = null;
        }
      }

      // 4. Criar informação da sessão
      const userInfo = {
        id: String(decoded.id),
        nome: decoded.nome,
        loja: decoded.loja || '',
        idl: String(decoded.lojaid || 0),
        NivelAcesso: decoded.NivelAcesso,
        accessToken,
        logo:
          shopData?.logoUrl ||
          '/placeholder.svg',
        email: decoded.email,
      };

      // 5. Iniciar sessão
      login(userInfo);

      // 6. Verificar administrador global
      const isAdminGlobal =
        decoded.NivelAcesso === 'ROLE_ADMIN' &&
        (
          !decoded.lojaid ||
          String(decoded.lojaid) === '0'
        );

      // ==================================================
      // 7. PRIMEIRO ACESSO
      // ==================================================

      if (firstLogin === true) {

        setFirstLoginIsAdminGlobal(
          isAdminGlobal
        );

        setFirstLoginPassword('');
        setFirstLoginConfirmPassword('');

        setAuthView('first-password');

        showSuccessToast(
          'Primeiro acesso. Defina uma nova palavra-passe.'
        );

        return;
      }

      // ==================================================
      // 8. LOGIN NORMAL
      // ==================================================

      showSuccessToast(
        'Login realizado com sucesso!'
      );

      navigate(
        isAdminGlobal
          ? '/select-store'
          : '/dashboard'
      );

    } catch (error: unknown) {

      let errorMessage =
        'Erro ao fazer login. Verifique as suas credenciais.';

      if (
        axios.isAxiosError(error) &&
        error.response
      ) {
        errorMessage =
          (
            error.response.data as {
              message?: string
            }
          )?.message ||
          errorMessage;
      }

      showErrorToast(errorMessage);

    } finally {
      setIsLoading(false);
    }
  };

  // ==================================================
  // PRIMEIRO ACESSO
  // ==================================================

  const handleFirstPasswordChange =
    async () => {

      // -----------------------------------------------
      // VALIDAR NOVA PALAVRA-PASSE
      // -----------------------------------------------

      if (!firstLoginPassword.trim()) {
        showErrorToast(
          'Introduza a nova palavra-passe.'
        );
        return;
      }

      if (firstLoginPassword.length < 8) {
        showErrorToast(
          'A nova palavra-passe deve ter pelo menos 8 caracteres.'
        );
        return;
      }

      // -----------------------------------------------
      // CONFIRMAR PALAVRA-PASSE
      // -----------------------------------------------

      if (
        !firstLoginConfirmPassword.trim()
      ) {
        showErrorToast(
          'Confirme a nova palavra-passe.'
        );
        return;
      }

      if (
        firstLoginPassword !==
        firstLoginConfirmPassword
      ) {
        showErrorToast(
          'As palavras-passe não coincidem.'
        );
        return;
      }

      setFirstLoginLoading(true);

      try {

        // ---------------------------------------------
        // ALTERAR PALAVRA-PASSE
        // ---------------------------------------------

        const response =
          await api.post(
            '/employee/change-first-password',
            {
              novaSenha:
                firstLoginPassword,
            }
          );

        const message =
          response.data?.message ||
          'Palavra-passe alterada com sucesso.';

        // ---------------------------------------------
        // LIMPAR CAMPOS
        // ---------------------------------------------

        setFirstLoginPassword('');
        setFirstLoginConfirmPassword('');

        // ---------------------------------------------
        // MENSAGEM
        // ---------------------------------------------

        showSuccessToast(message);

        // ---------------------------------------------
        // IR PARA O SISTEMA
        // ---------------------------------------------

        navigate(
          firstLoginIsAdminGlobal
            ? '/select-store'
            : '/dashboard'
        );

      } catch (error: unknown) {

        let errorMessage =
          'Não foi possível alterar a palavra-passe.';

        if (
          axios.isAxiosError(error) &&
          error.response
        ) {
          errorMessage =
            (
              error.response.data as {
                message?: string
              }
            )?.message ||
            errorMessage;
        }

        showErrorToast(errorMessage);

      } finally {
        setFirstLoginLoading(false);
      }
    };

  // ==================================================
  // ENVIAR CÓDIGO DE RECUPERAÇÃO
  // ==================================================

  const handleForgotPassword =
    async () => {

      if (!recoveryEmail.trim()) {
        showErrorToast(
          'Introduza o seu endereço de e-mail.'
        );
        return;
      }

      setRecoveryLoading(true);

      try {

        const response =
          await api.post(
            '/employee/forgot-password',
            {
              email:
                recoveryEmail.trim(),
            }
          );

        const message =
          response.data?.message ||
          'Pedido de recuperação processado.';

        showSuccessToast(message);

        setAuthView(
          'forgot-reset'
        );

      } catch (error: unknown) {

        let errorMessage =
          'Não foi possível enviar o código de recuperação.';

        if (
          axios.isAxiosError(error) &&
          error.response
        ) {
          errorMessage =
            (
              error.response.data as {
                message?: string
              }
            )?.message ||
            errorMessage;
        }

        showErrorToast(errorMessage);

      } finally {
        setRecoveryLoading(false);
      }
    };

  // ==================================================
  // RECUPERAÇÃO - NOVA PALAVRA-PASSE
  // ==================================================

  const handleResetPassword =
    async () => {

      // -----------------------------------------------
      // VALIDAR CÓDIGO
      // -----------------------------------------------

      if (!recoveryCode.trim()) {
        showErrorToast(
          'Introduza o código de recuperação.'
        );
        return;
      }

      // -----------------------------------------------
      // VALIDAR NOVA PALAVRA-PASSE
      // -----------------------------------------------

      if (!newPassword.trim()) {
        showErrorToast(
          'Introduza a nova palavra-passe.'
        );
        return;
      }

      if (newPassword.length < 8) {
        showErrorToast(
          'A nova palavra-passe deve ter pelo menos 8 caracteres.'
        );
        return;
      }

      // -----------------------------------------------
      // CONFIRMAR
      // -----------------------------------------------

      if (!confirmPassword.trim()) {
        showErrorToast(
          'Confirme a nova palavra-passe.'
        );
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        showErrorToast(
          'As palavras-passe não coincidem.'
        );
        return;
      }

      setRecoveryLoading(true);

      try {

        await api.post(
          '/employee/reset-password',
          {
            email:
              recoveryEmail.trim(),
            codigo:
              recoveryCode.trim(),
            novaSenha:
              newPassword,
          }
        );

        showSuccessToast(
          'Palavra-passe alterada com sucesso!'
        );

        // Limpar dados
        setRecoveryEmail('');
        setRecoveryCode('');
        setNewPassword('');
        setConfirmPassword('');

        // Voltar ao login
        setAuthView('login');

      } catch (error: unknown) {

        let errorMessage =
          'Não foi possível alterar a palavra-passe.';

        if (
          axios.isAxiosError(error) &&
          error.response
        ) {
          errorMessage =
            (
              error.response.data as {
                message?: string
              }
            )?.message ||
            errorMessage;
        }

        showErrorToast(errorMessage);

      } finally {
        setRecoveryLoading(false);
      }
    };

  // ==================================================
  // VOLTAR AO LOGIN
  // ==================================================

  const handleBackToLogin =
    () => {

      setAuthView('login');

      setRecoveryEmail('');
      setRecoveryCode('');
      setNewPassword('');
      setConfirmPassword('');

      setFirstLoginPassword('');
      setFirstLoginConfirmPassword('');
    };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4"
      style={{
        backgroundImage:
          `url('/images/vendas-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >

      {/* Overlay */}
      <div
        className="
          absolute inset-0
          bg-black/15
          backdrop-blur-[1px]
        "
      />

      {/* Espaçador */}
      <div
        className="
          h-20 sm:h-32
          w-full
          relative z-10
        "
      />

      <div
        className="
          w-full
          max-w-[380px]
          relative z-10
        "
      >

        <Card
          className={cn(
            "shadow-2xl border-0 bg-white/20",
            "backdrop-blur-xl",
            "rounded-2xl p-2 sm:p-4",
            "border border-white/30",
            "transition-all duration-300",
            "ease-in-out",
            "hover:shadow-blue-500/10"
          )}
        >

          {/* ==================================================
              LOGIN
              ================================================== */}

          {authView === 'login' && (
            <>

              <CardHeader
                className="
                  space-y-1
                  text-center
                  pb-4
                  pt-2
                "
              >

                <div
                  className={cn(
                    "mx-auto w-14 h-14",
                    "bg-gradient-to-br",
                    "from-blue-600 to-indigo-700",
                    "rounded-full",
                    "flex items-center justify-center",
                    "mb-3",
                    "shadow-lg shadow-blue-500/20",
                    "transition-transform duration-500",
                    "hover:scale-105"
                  )}
                >
                  <User
                    className="
                      w-7 h-7
                      text-white
                    "
                  />
                </div>

                <CardTitle
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                    tracking-tight
                  "
                >
                  Acesso ao Sistema
                </CardTitle>

                <CardDescription
                  className="
                    text-gray-800
                    text-xs
                    font-medium
                  "
                >
                  Introduza Email ou Username
                </CardDescription>

              </CardHeader>

              <CardContent
                className="pb-6"
              >

                <form
                  onSubmit={
                    handleSubmit(handleLogin)
                  }
                  className="space-y-4"
                >

                  {/* IDENTIFICADOR */}

                  <div
                    className="
                      space-y-1.5
                    "
                  >

                    <Label
                      htmlFor="identifier"
                      className="
                        text-xs
                        font-bold
                        text-gray-900
                        ml-1
                      "
                    >
                      Identificador
                    </Label>

                    <div className="relative group">

                      <User
                        className="
                          absolute
                          left-3
                          top-1/2
                          transform
                          -translate-y-1/2
                          h-4 w-4
                          text-gray-600
                        "
                      />

                      <Input
                        id="identifier"
                        type="text"
                        placeholder="
                          Email ou nome de usuário
                        "
                        className={cn(
                          "pl-9 h-10",
                          "bg-white/40",
                          "border-white/50",
                          "focus:bg-white/60",
                          "text-sm",
                          errors.identifier &&
                            "border-red-500"
                        )}
                        {...register(
                          'identifier'
                        )}
                        disabled={isLoading}
                      />

                    </div>

                    {errors.identifier && (
                      <p
                        className="
                          text-[10px]
                          font-bold
                          text-red-600
                          ml-1
                        "
                      >
                        {
                          errors.identifier
                            .message
                        }
                      </p>
                    )}

                  </div>

                  {/* SENHA */}

                  <div
                    className="
                      space-y-1.5
                    "
                  >

                    <Label
                      htmlFor="password"
                      className="
                        text-xs
                        font-bold
                        text-gray-900
                        ml-1
                      "
                    >
                      Senha
                    </Label>

                    <div
                      className="
                        relative group
                      "
                    >

                      <Lock
                        className="
                          absolute
                          left-3
                          top-1/2
                          transform
                          -translate-y-1/2
                          h-4 w-4
                          text-gray-600
                        "
                      />

                      <Input
                        id="password"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        placeholder="••••••••"
                        className={cn(
                          "pl-9 pr-9 h-10",
                          "bg-white/40",
                          "border-white/50",
                          "focus:bg-white/60",
                          "text-sm",
                          errors.password &&
                            "border-red-500"
                        )}
                        {...register('password')}
                        disabled={isLoading}
                      />

                      <button
                        type="button"
                        className="
                          absolute
                          right-3
                          top-1/2
                          transform
                          -translate-y-1/2
                          text-gray-600
                          hover:text-blue-600
                        "
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff
                            className="h-4 w-4"
                          />
                        ) : (
                          <Eye
                            className="h-4 w-4"
                          />
                        )}
                      </button>

                    </div>

                    {errors.password && (
                      <p
                        className="
                          text-[10px]
                          font-bold
                          text-red-600
                          ml-1
                        "
                      >
                        {
                          errors.password
                            .message
                        }
                      </p>
                    )}

                    {/* ESQUECEU */}

                    <div
                      className="
                        flex
                        justify-end
                        px-1
                        pt-0.5
                      "
                    >

                      <button
                        type="button"
                        onClick={() =>
                          setAuthView(
                            'forgot-email'
                          )
                        }
                        className="
                          text-[10px]
                          font-bold
                          text-blue-800
                          hover:underline
                        "
                        disabled={isLoading}
                      >
                        Esqueceu a senha?
                      </button>

                    </div>

                  </div>

                  {/* BOTÃO */}

                  <Button
                    type="submit"
                    className={cn(
                      "w-full h-10",
                      "text-sm font-bold",
                      "text-white mt-2",
                      "bg-gradient-to-r",
                      "from-blue-600 to-indigo-700",
                      "hover:from-blue-700",
                      "hover:to-indigo-800",
                      "shadow-md",
                      "shadow-blue-600/20",
                      "border-0",
                      "transition-all",
                      "active:scale-[0.97]",
                      isLoading &&
                        "opacity-80"
                    )}
                    disabled={isLoading}
                  >

                    {isLoading ? (
                      <Loader2
                        className="
                          h-4 w-4
                          animate-spin
                        "
                      />
                    ) : (
                      'Entrar'
                    )}

                  </Button>

                </form>

              </CardContent>

            </>
          )}

          {/* ==================================================
              PRIMEIRO ACESSO
              ================================================== */}

          {authView === 'first-password' && (
            <>

              <CardHeader
                className="
                  space-y-1
                  text-center
                  pb-4
                  pt-2
                "
              >

                <div
                  className={cn(
                    "mx-auto w-14 h-14",
                    "bg-gradient-to-br",
                    "from-blue-600 to-indigo-700",
                    "rounded-full",
                    "flex items-center justify-center",
                    "mb-3",
                    "shadow-lg shadow-blue-500/20"
                  )}
                >
                  <ShieldCheck
                    className="
                      w-7 h-7
                      text-white
                    "
                  />
                </div>

                <CardTitle
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                  "
                >
                  Primeiro acesso
                </CardTitle>

                <CardDescription
                  className="
                    text-gray-800
                    text-xs
                    font-medium
                  "
                >
                  A sua palavra-passe é temporária.
                  <br />
                  Defina uma nova para continuar.
                </CardDescription>

              </CardHeader>

              <CardContent
                className="pb-6"
              >

                <div className="space-y-4">

                  {/* NOVA PALAVRA-PASSE */}

                  <div
                    className="
                      space-y-1.5
                    "
                  >

                    <Label
                      htmlFor="first-login-password"
                      className="
                        text-xs
                        font-bold
                        text-gray-900
                        ml-1
                      "
                    >
                      Nova palavra-passe
                    </Label>

                    <div
                      className="
                        relative
                      "
                    >

                      <Lock
                        className="
                          absolute
                          left-3
                          top-1/2
                          transform
                          -translate-y-1/2
                          h-4 w-4
                          text-gray-600
                        "
                      />

                      <Input
                        id="first-login-password"
                        type={
                          showFirstLoginPassword
                            ? 'text'
                            : 'password'
                        }
                        placeholder="
                          Mínimo 8 caracteres
                        "
                        value={
                          firstLoginPassword
                        }
                        onChange={(e) =>
                          setFirstLoginPassword(
                            e.target.value
                          )
                        }
                        disabled={
                          firstLoginLoading
                        }
                        className="
                          pl-9 pr-9 h-10
                          bg-white/40
                          border-white/50
                          focus:bg-white/60
                          text-sm
                        "
                      />

                      <button
                        type="button"
                        className="
                          absolute
                          right-3
                          top-1/2
                          transform
                          -translate-y-1/2
                          text-gray-600
                          hover:text-blue-600
                        "
                        onClick={() =>
                          setShowFirstLoginPassword(
                            !showFirstLoginPassword
                          )
                        }
                        disabled={
                          firstLoginLoading
                        }
                      >
                        {showFirstLoginPassword ? (
                          <EyeOff
                            className="h-4 w-4"
                          />
                        ) : (
                          <Eye
                            className="h-4 w-4"
                          />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* CONFIRMAR */}

                  <div
                    className="
                      space-y-1.5
                    "
                  >

                    <Label
                      htmlFor="
                        first-login-confirm-password
                      "
                      className="
                        text-xs
                        font-bold
                        text-gray-900
                        ml-1
                      "
                    >
                      Confirmar palavra-passe
                    </Label>

                    <div
                      className="
                        relative
                      "
                    >

                      <Lock
                        className="
                          absolute
                          left-3
                          top-1/2
                          transform
                          -translate-y-1/2
                          h-4 w-4
                          text-gray-600
                        "
                      />

                      <Input
                        id="
                          first-login-confirm-password
                        "
                        type={
                          showFirstLoginConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        placeholder="
                          Repita a nova palavra-passe
                        "
                        value={
                          firstLoginConfirmPassword
                        }
                        onChange={(e) =>
                          setFirstLoginConfirmPassword(
                            e.target.value
                          )
                        }
                        disabled={
                          firstLoginLoading
                        }
                        className="
                          pl-9 pr-9 h-10
                          bg-white/40
                          border-white/50
                          focus:bg-white/60
                          text-sm
                        "
                      />

                      <button
                        type="button"
                        className="
                          absolute
                          right-3
                          top-1/2
                          transform
                          -translate-y-1/2
                          text-gray-600
                          hover:text-blue-600
                        "
                        onClick={() =>
                          setShowFirstLoginConfirmPassword(
                            !showFirstLoginConfirmPassword
                          )
                        }
                        disabled={
                          firstLoginLoading
                        }
                      >
                        {showFirstLoginConfirmPassword ? (
                          <EyeOff
                            className="h-4 w-4"
                          />
                        ) : (
                          <Eye
                            className="h-4 w-4"
                          />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* BOTÃO */}

                  <Button
                    type="button"
                    onClick={
                      handleFirstPasswordChange
                    }
                    disabled={
                      firstLoginLoading
                    }
                    className={cn(
                      "w-full h-10",
                      "text-sm font-bold",
                      "text-white",
                      "bg-gradient-to-r",
                      "from-blue-600 to-indigo-700",
                      "hover:from-blue-700",
                      "hover:to-indigo-800",
                      "shadow-md",
                      "shadow-blue-600/20",
                      "border-0"
                    )}
                  >

                    {firstLoginLoading ? (
                      <Loader2
                        className="
                          h-4 w-4
                          animate-spin
                        "
                      />
                    ) : (
                      'Alterar palavra-passe'
                    )}

                  </Button>

                </div>

              </CardContent>

            </>
          )}

          {/* ==================================================
              RECUPERAÇÃO - E-MAIL
              ================================================== */}

          {authView === 'forgot-email' && (
            <>

              <CardHeader
                className="
                  space-y-1
                  text-center
                  pb-4
                  pt-2
                "
              >

                <div
                  className={cn(
                    "mx-auto w-14 h-14",
                    "bg-gradient-to-br",
                    "from-blue-600 to-indigo-700",
                    "rounded-full",
                    "flex items-center justify-center",
                    "mb-3",
                    "shadow-lg shadow-blue-500/20"
                  )}
                >
                  <Mail
                    className="
                      w-7 h-7
                      text-white
                    "
                  />
                </div>

                <CardTitle
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                  "
                >
                  Recuperar palavra-passe
                </CardTitle>

                <CardDescription
                  className="
                    text-gray-800
                    text-xs
                    font-medium
                  "
                >
                  Introduza o e-mail associado à sua conta
                </CardDescription>

              </CardHeader>

              <CardContent
                className="pb-6"
              >

                <div className="space-y-4">

                  {/* E-MAIL */}

                  <div
                    className="
                      space-y-1.5
                    "
                  >

                    <Label
                      htmlFor="recovery-email"
                      className="
                        text-xs
                        font-bold
                        text-gray-900
                        ml-1
                      "
                    >
                      E-mail
                    </Label>

                    <div
                      className="
                        relative
                      "
                    >

                      <Mail
                        className="
                          absolute
                          left-3
                          top-1/2
                          transform
                          -translate-y-1/2
                          h-4 w-4
                          text-gray-600
                        "
                      />

                      <Input
                        id="recovery-email"
                        type="email"
                        placeholder="
                          exemplo@email.com
                        "
                        value={recoveryEmail}
                        onChange={(e) =>
                          setRecoveryEmail(
                            e.target.value
                          )
                        }
                        disabled={
                          recoveryLoading
                        }
                        className="
                          pl-9 h-10
                          bg-white/40
                          border-white/50
                          focus:bg-white/60
                          text-sm
                        "
                      />

                    </div>

                  </div>

                  {/* ENVIAR */}

                  <Button
                    type="button"
                    onClick={
                      handleForgotPassword
                    }
                    disabled={
                      recoveryLoading
                    }
                    className={cn(
                      "w-full h-10",
                      "text-sm font-bold",
                      "text-white",
                      "bg-gradient-to-r",
                      "from-blue-600 to-indigo-700",
                      "hover:from-blue-700",
                      "hover:to-indigo-800",
                      "shadow-md",
                      "shadow-blue-600/20",
                      "border-0"
                    )}
                  >

                    {recoveryLoading ? (
                      <Loader2
                        className="
                          h-4 w-4
                          animate-spin
                        "
                      />
                    ) : (
                      'Enviar código'
                    )}

                  </Button>

                  {/* VOLTAR */}

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={
                      handleBackToLogin
                    }
                    disabled={
                      recoveryLoading
                    }
                    className="
                      w-full h-9
                      text-xs font-bold
                      text-gray-800
                      hover:text-blue-700
                    "
                  >
                    <ArrowLeft
                      className="
                        w-4 h-4 mr-2
                      "
                    />
                    Voltar ao Login
                  </Button>

                </div>

              </CardContent>

            </>
          )}

          {/* ==================================================
              RECUPERAÇÃO - NOVA PASSWORD
              ================================================== */}

          {authView === 'forgot-reset' && (
            <>

              <CardHeader
                className="
                  space-y-1
                  text-center
                  pb-4
                  pt-2
                "
              >

                <div
                  className={cn(
                    "mx-auto w-14 h-14",
                    "bg-gradient-to-br",
                    "from-blue-600 to-indigo-700",
                    "rounded-full",
                    "flex items-center justify-center",
                    "mb-3",
                    "shadow-lg shadow-blue-500/20"
                  )}
                >
                  <KeyRound
                    className="
                      w-7 h-7
                      text-white
                    "
                  />
                </div>

                <CardTitle
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                  "
                >
                  Nova palavra-passe
                </CardTitle>

                <CardDescription
                  className="
                    text-gray-800
                    text-xs
                    font-medium
                  "
                >
                  Introduza o código recebido e defina uma nova palavra-passe
                </CardDescription>

              </CardHeader>

              <CardContent
                className="pb-6"
              >

                <div className="space-y-4">

                  {/* E-MAIL */}

                  <div
                    className="
                      space-y-1.5
                    "
                  >

                    <Label
                      htmlFor="reset-email"
                      className="
                        text-xs
                        font-bold
                        text-gray-900
                        ml-1
                      "
                    >
                      E-mail
                    </Label>

                    <Input
                      id="reset-email"
                      type="email"
                      value={recoveryEmail}
                      disabled
                      className="
                        h-10
                        bg-white/30
                        border-white/50
                        text-sm
                      "
                    />

                  </div>

                  {/* CÓDIGO */}

                  <div
                    className="
                      space-y-1.5
                    "
                  >

                    <Label
                      htmlFor="recovery-code"
                      className="
                        text-xs
                        font-bold
                        text-gray-900
                        ml-1
                      "
                    >
                      Código de recuperação
                    </Label>

                    <div
                      className="
                        relative
                      "
                    >

                      <KeyRound
                        className="
                          absolute
                          left-3
                          top-1/2
                          transform
                          -translate-y-1/2
                          h-4 w-4
                          text-gray-600
                        "
                      />

                      <Input
                        id="recovery-code"
                        type="text"
                        placeholder="
                          Introduza o código
                        "
                        value={recoveryCode}
                        onChange={(e) =>
                          setRecoveryCode(
                            e.target.value
                          )
                        }
                        disabled={
                          recoveryLoading
                        }
                        className="
                          pl-9 h-10
                          bg-white/40
                          border-white/50
                          focus:bg-white/60
                          text-sm
                        "
                      />

                    </div>

                  </div>

                  {/* NOVA PASSWORD */}

                  <div
                    className="
                      space-y-1.5
                    "
                  >

                    <Label
                      htmlFor="new-password"
                      className="
                        text-xs
                        font-bold
                        text-gray-900
                        ml-1
                      "
                    >
                      Nova palavra-passe
                    </Label>

                    <div
                      className="
                        relative
                      "
                    >

                      <Lock
                        className="
                          absolute
                          left-3
                          top-1/2
                          transform
                          -translate-y-1/2
                          h-4 w-4
                          text-gray-600
                        "
                      />

                      <Input
                        id="new-password"
                        type={
                          showNewPassword
                            ? 'text'
                            : 'password'
                        }
                        placeholder="
                          Mínimo 8 caracteres
                        "
                        value={newPassword}
                        onChange={(e) =>
                          setNewPassword(
                            e.target.value
                          )
                        }
                        disabled={
                          recoveryLoading
                        }
                        className="
                          pl-9 pr-9 h-10
                          bg-white/40
                          border-white/50
                          focus:bg-white/60
                          text-sm
                        "
                      />

                      <button
                        type="button"
                        className="
                          absolute
                          right-3
                          top-1/2
                          transform
                          -translate-y-1/2
                          text-gray-600
                          hover:text-blue-600
                        "
                        onClick={() =>
                          setShowNewPassword(
                            !showNewPassword
                          )
                        }
                        disabled={
                          recoveryLoading
                        }
                      >
                        {showNewPassword ? (
                          <EyeOff
                            className="h-4 w-4"
                          />
                        ) : (
                          <Eye
                            className="h-4 w-4"
                          />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* CONFIRMAR PASSWORD */}

                  <div
                    className="
                      space-y-1.5
                    "
                  >

                    <Label
                      htmlFor="confirm-password"
                      className="
                        text-xs
                        font-bold
                        text-gray-900
                        ml-1
                      "
                    >
                      Confirmar palavra-passe
                    </Label>

                    <div
                      className="
                        relative
                      "
                    >

                      <Lock
                        className="
                          absolute
                          left-3
                          top-1/2
                          transform
                          -translate-y-1/2
                          h-4 w-4
                          text-gray-600
                        "
                      />

                      <Input
                        id="confirm-password"
                        type={
                          showConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        placeholder="
                          Repita a nova palavra-passe
                        "
                        value={
                          confirmPassword
                        }
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value
                          )
                        }
                        disabled={
                          recoveryLoading
                        }
                        className="
                          pl-9 pr-9 h-10
                          bg-white/40
                          border-white/50
                          focus:bg-white/60
                          text-sm
                        "
                      />

                      <button
                        type="button"
                        className="
                          absolute
                          right-3
                          top-1/2
                          transform
                          -translate-y-1/2
                          text-gray-600
                          hover:text-blue-600
                        "
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        disabled={
                          recoveryLoading
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff
                            className="h-4 w-4"
                          />
                        ) : (
                          <Eye
                            className="h-4 w-4"
                          />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* ALTERAR */}

                  <Button
                    type="button"
                    onClick={
                      handleResetPassword
                    }
                    disabled={
                      recoveryLoading
                    }
                    className={cn(
                      "w-full h-10",
                      "text-sm font-bold",
                      "text-white",
                      "bg-gradient-to-r",
                      "from-blue-600 to-indigo-700",
                      "hover:from-blue-700",
                      "hover:to-indigo-800",
                      "shadow-md",
                      "shadow-blue-600/20",
                      "border-0"
                    )}
                  >

                    {recoveryLoading ? (
                      <Loader2
                        className="
                          h-4 w-4
                          animate-spin
                        "
                      />
                    ) : (
                      'Alterar palavra-passe'
                    )}

                  </Button>

                  {/* VOLTAR */}

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={
                      handleBackToLogin
                    }
                    disabled={
                      recoveryLoading
                    }
                    className="
                      w-full h-9
                      text-xs font-bold
                      text-gray-800
                      hover:text-blue-700
                    "
                  >
                    <ArrowLeft
                      className="
                        w-4 h-4 mr-2
                      "
                    />
                    Voltar ao Login
                  </Button>

                </div>

              </CardContent>

            </>
          )}

        </Card>

        {/* RODAPÉ */}

        <p
          className="
            text-center
            mt-6
            text-gray-900
            text-[10px]
            font-bold
            uppercase
            tracking-widest
            opacity-80
          "
        >
          &copy; {new Date().getFullYear()} Sistema de Vendas
        </p>

      </div>

    </div>
  );
};

export default LoginPage;