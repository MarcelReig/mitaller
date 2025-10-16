// TODO: Página de perfil del artesano
// - Información del artesano (bio, ubicación, contacto)
// - Tabs: Portfolio (obras) y Tienda (productos)
// - Galería de imágenes con lightbox

type Props = {
  params: { slug: string };
};

export default function ArtesanoPerfilPage({ params }: Props) {
  return (
    <div>
      <h1>Perfil del Artesano: {params.slug}</h1>
      {/* TODO: Implementar */}
    </div>
  );
}

