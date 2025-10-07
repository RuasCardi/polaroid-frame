import { Camera, Award, Users, Heart } from "lucide-react";

const Sobre = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 md:order-1">
            <h1 className="text-4xl md:text-5xl mb-6">Sobre Juliana Cardinalli</h1>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                Olá! Sou fotógrafa profissional especializada em capturar momentos especiais e emoções autênticas.
                Com mais de 10 anos de experiência, transformo seus momentos em memórias eternas.
              </p>
              <p>
                Minha paixão pela fotografia começou ainda na adolescência, e desde então venho me dedicando
                a aperfeiçoar minha técnica e meu olhar artístico. Cada evento é único, e busco capturar
                a essência e a emoção de cada momento com sensibilidade e profissionalismo.
              </p>
              <p>
                Trabalho com equipamentos de última geração e estou sempre atualizada com as mais novas
                tendências e técnicas de fotografia e edição, garantindo que você receba um trabalho
                de altíssima qualidade.
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="aspect-[3/4] bg-muted rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800"
                alt="Juliana Cardinalli"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">500+</div>
            <div className="text-muted-foreground">Eventos Realizados</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">10+</div>
            <div className="text-muted-foreground">Anos de Experiência</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">50k+</div>
            <div className="text-muted-foreground">Fotos Entregues</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">100%</div>
            <div className="text-muted-foreground">Clientes Satisfeitos</div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl text-center mb-12">Especialidades</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card p-6 rounded-xl shadow-sm text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-accent">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Casamentos</h3>
              <p className="text-muted-foreground">
                Registro completo do seu dia especial, da preparação à festa
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-accent">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Formaturas</h3>
              <p className="text-muted-foreground">
                Celebre sua conquista com fotos profissionais e marcantes
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-accent">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Ensaios</h3>
              <p className="text-muted-foreground">
                Gestante, família, 15 anos e muito mais
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-accent">
                <Camera className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Eventos</h3>
              <p className="text-muted-foreground">
                Corporativos, aniversários e celebrações em geral
              </p>
            </div>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="bg-accent/30 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl text-center mb-8">Equipamentos</h2>
          <div className="max-w-3xl mx-auto space-y-4 text-muted-foreground">
            <p>
              <strong>Câmeras:</strong> Canon EOS R5, Canon 5D Mark IV (backup)
            </p>
            <p>
              <strong>Lentes:</strong> Canon RF 28-70mm f/2L, Canon EF 70-200mm f/2.8L IS III,
              Canon RF 50mm f/1.2L, Canon EF 24mm f/1.4L II
            </p>
            <p>
              <strong>Iluminação:</strong> Flashes Profoto, rebatedores e difusores profissionais
            </p>
            <p>
              <strong>Edição:</strong> Adobe Lightroom Classic, Adobe Photoshop, Capture One
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sobre;
