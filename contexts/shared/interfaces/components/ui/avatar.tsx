import * as React from "react"

import { cn } from "@/lib/utils"

type AvatarImageProps = React.ComponentProps<"img">
type AvatarFallbackProps = React.ComponentProps<"span">

function Avatar({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  const elements = React.Children.toArray(children).filter(React.isValidElement)

  const imageElement = elements.find(
    (child): child is React.ReactElement<AvatarImageProps> =>
      React.isValidElement(child) && child.type === AvatarImage,
  )
  const fallbackElement = elements.find(
    (child): child is React.ReactElement<AvatarFallbackProps> =>
      React.isValidElement(child) && child.type === AvatarFallback,
  )

  const imageSrc = imageElement?.props.src
  const hasImage = typeof imageSrc === "string" ? imageSrc.length > 0 : !!imageSrc

  return (
    <span
      data-slot="avatar"
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full bg-muted",
        className,
      )}
      {...props}
    >
      {hasImage
        ? imageElement
        : fallbackElement ?? (
            <span
              data-slot="avatar-fallback"
              className="flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground"
            />
          )}
    </span>
  )
}

function AvatarImage({ className, alt, ...props }: AvatarImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-slot="avatar-image"
      alt={alt}
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
