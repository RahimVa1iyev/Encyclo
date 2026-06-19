import { AuthLayout } from "@/components/auth/AuthLayout";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const onboardingFeatures = [
    {
      title: "Dəqiq kateqorizasiya",
      description: "Fəaliyyət sahənizi dəqiq qeyd etməyiniz, sizin hədəf kütlənizə daha rahat çatmanızı təmin edəcək."
    },
    {
      title: "AI üçün vizit kartınız",
      description: "Təsvir hissəsində qeyd etdiyiniz bütün sözlər AI axtarış motorlarında baza olaraq istifadə ediləcək."
    }
  ];

  return (
    <AuthLayout
      title={
        <>
          Profilinizi{" "}
          <span style={{ color: 'var(--accent)' }}>
            tamamlayın
          </span>
        </>
      }
      description="Şirkətinizin fəaliyyəti, məzmunu və loqosu barədə qısa məlumat verin ki, biz sizin üçün mükəmməl profil yarada bilək."
      features={onboardingFeatures}
    >
      {children}
    </AuthLayout>
  );
}
