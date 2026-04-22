import { PageIdentityBar } from '../components/page-identity-bar'
import { Logo } from '../components/ui/logo'

function LogoCapturePage() {
  return (
    <div className="min-h-screen bg-forest-950">
      <PageIdentityBar
        compact
        label="Logo Capture"
        eyebrow="Utility page"
        description="High-resolution capture surface for the Golf Sol Ireland mark."
      />
      <div className="p-16">
        <div className="inline-block">
          <div className="inline-flex items-center">
            <div id="logo-capture-target">
              <Logo
                className="gap-8 [&_.logo-tagline]:!text-[1.5rem] [&_.logo-wordmark-ireland]:!text-[4rem] [&_.logo-wordmark-main]:!text-[8rem] [&_img]:!h-40 [&_img]:!w-40 [&_img]:!scale-[1.55] [&_svg]:!h-14 [&_svg]:!w-14"
                tone="hero"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { LogoCapturePage }
