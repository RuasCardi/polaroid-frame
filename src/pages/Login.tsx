import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { isEmailWhitelistedAdmin } from "@/constants/admin";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres");

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const checkAdminRole = useCallback(async (
    userId: string,
    userEmail?: string | null,
    silent = false,
  ): Promise<boolean | null> => {
    if (!isSupabaseConfigured || !supabase) {
      if (!silent) {
        toast({
          title: "Configuração necessária",
          description: "Supabase não configurado. Não é possível validar permissões.",
          variant: "destructive",
        });
      }
      return null;
    }

    const { data, error } = await supabase.rpc("has_role", {
      _role: "admin",
      _user_id: userId,
    });

    if (error) {
      console.error("Erro ao verificar permissões de administrador:", error);
      if (isEmailWhitelistedAdmin(userEmail)) {
        if (!silent) {
          toast({
            title: "Acesso liberado",
            description: "Não foi possível confirmar seu papel, mas seu email está autorizado.",
          });
        }
        return true;
      }
      if (!silent) {
        toast({
          title: "Erro de permissão",
          description: "Não foi possível confirmar seu acesso de administrador.",
          variant: "destructive",
        });
      }
      return null;
    }

    if (data === true) {
      return true;
    }

    if (isEmailWhitelistedAdmin(userEmail)) {
      return true;
    }

    return false;
  }, [toast]);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      if (!isSupabaseConfigured || !supabase) {
        toast({
          title: "Configuração necessária",
          description: "Supabase não configurado. Configure as variáveis de ambiente para autenticar.",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const isAdmin = await checkAdminRole(user.id, user.email, true);

        if (isAdmin) {
          navigate("/admin");
        } else if (isAdmin === false) {
          navigate("/");
        }
      }
    };
    checkUser();
  }, [checkAdminRole, navigate, toast]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase não configurado");
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Cadastro realizado!",
          description: "Você foi cadastrado com sucesso. Faça login para continuar.",
        });
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível concluir o cadastro.";
      toast({
        title: "Erro ao cadastrar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase não configurado");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        const isAdmin = await checkAdminRole(data.user.id, data.user.email);

        if (isAdmin) {
          toast({
            title: "Login realizado!",
            description: "Bem-vindo ao painel admin",
          });
          navigate("/admin");
        } else if (isAdmin === false) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão de administrador",
            variant: "destructive",
          });
          await supabase.auth.signOut();
        } else {
          await supabase.auth.signOut();
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível realizar o login.";
      toast({
        title: "Erro ao fazer login",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Acesso Admin</CardTitle>
            <CardDescription>
              Entre com sua conta de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signin">Email</Label>
                    <Input
                      id="email-signin"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signin">Senha</Label>
                    <Input
                      id="password-signin"
                      type="password"
                      placeholder="••••••"
                      value={password}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Senha</Label>
                    <Input
                      id="password-signup"
                      type="password"
                      placeholder="••••••"
                      value={password}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Cadastrar"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
