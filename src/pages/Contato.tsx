import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Instagram, MapPin } from "lucide-react";

const Contato = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement actual form submission
    toast({
      title: "Mensagem enviada!",
      description: "Entrarei em contato em breve. Obrigada!",
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      eventType: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-4">Entre em Contato</h1>
          <p className="text-lg text-muted-foreground">
            Vamos conversar sobre como posso capturar seus momentos especiais
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-card p-8 rounded-2xl shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="eventType">Tipo de evento</Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione o tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casamento">Casamento</SelectItem>
                    <SelectItem value="formatura">Formatura</SelectItem>
                    <SelectItem value="ensaio-gestante">Ensaio Gestante</SelectItem>
                    <SelectItem value="ensaio-familia">Ensaio Família</SelectItem>
                    <SelectItem value="15-anos">15 Anos</SelectItem>
                    <SelectItem value="aniversario">Aniversário</SelectItem>
                    <SelectItem value="corporativo">Evento Corporativo</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  className="mt-2"
                  placeholder="Conte-me mais sobre seu evento..."
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Enviar Mensagem
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-card p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-semibold mb-6">Informações de Contato</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <div className="font-medium">E-mail</div>
                    <a href="mailto:juhcardinalli@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                      juhcardinalli@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <div className="font-medium">Telefone / WhatsApp</div>
                    <a href="tel:+5519996117683" className="text-muted-foreground hover:text-primary transition-colors">
                      (19) 996117683
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Instagram className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <div className="font-medium">Instagram</div>
                    <a href="https://instagram.com/cardimagens" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      @cardimagens
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <div className="font-medium">Localização</div>
                    <div className="text-muted-foreground">
                      Niteroi, RJ<br />
                      Atendo toda região
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-accent/30 p-8 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">Horário de Atendimento</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Segunda a Sexta:</strong> 9h às 18h</p>
                <p><strong>Sábado:</strong> 9h às 14h</p>
                <p><strong>Domingo:</strong> Fechado</p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                * Atendimento de eventos aos finais de semana mediante agendamento
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contato;
