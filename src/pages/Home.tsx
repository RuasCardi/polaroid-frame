import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Heart, Award } from "lucide-react";

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl leading-tight">
                Capturando
                <br />
                <span className="text-muted-foreground">Momentos Únicos</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Fotografia de eventos, retratos e momentos especiais que merecem ser eternizados com arte e sensibilidade.
              </p>
              <Link to="/galeria">
                <Button size="lg" className="group">
                  Ver Galeria
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] bg-muted rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800"
                  alt="Fotografia profissional"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg max-w-xs hidden md:block">
                <p className="text-sm text-muted-foreground">
                  "Cada momento é único e merece ser capturado com perfeição"
                </p>
                <p className="mt-2 font-semibold">— Juliana Cardinalli</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl text-center mb-16">Por que escolher meu trabalho?</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-accent">
                <Camera className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Equipamento Profissional</h3>
              <p className="text-muted-foreground">
                Utilizo as melhores câmeras e lentes para garantir qualidade excepcional em cada foto.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-accent">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Conexão Autêntica</h3>
              <p className="text-muted-foreground">
                Crio um ambiente confortável para capturar emoções genuínas e naturais.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-accent">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Experiência Comprovada</h3>
              <p className="text-muted-foreground">
                Anos de experiência em eventos, casamentos, formaturas e ensaios fotográficos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl mb-6">Pronta para o seu ensaio?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Entre em contato e vamos conversar sobre como posso capturar seus momentos mais especiais.
          </p>
          <Link to="/contato">
            <Button size="lg" variant="outline">
              Entrar em Contato
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
