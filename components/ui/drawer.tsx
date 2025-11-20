'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

// Temporary stub types until vaul is installed
type DrawerPrimitiveRoot = React.ComponentType<any>;
type DrawerPrimitiveTrigger = React.ComponentType<any>;
type DrawerPrimitivePortal = React.ComponentType<any>;
type DrawerPrimitiveClose = React.ComponentType<any>;
type DrawerPrimitiveOverlay = React.ComponentType<any>;
type DrawerPrimitiveContent = React.ComponentType<any>;
type DrawerPrimitiveHeader = React.ComponentType<any>;
type DrawerPrimitiveTitle = React.ComponentType<any>;
type DrawerPrimitiveDescription = React.ComponentType<any>;
type DrawerPrimitiveFooter = React.ComponentType<any>;

// Stub DrawerPrimitive
const DrawerRoot = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} {...props} />
));
DrawerRoot.displayName = 'DrawerPrimitive.Root';

const DrawerTriggerStub = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
  <button ref={ref} {...props} />
));
DrawerTriggerStub.displayName = 'DrawerPrimitive.Trigger';

const DrawerPortalStub = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} {...props} />
));
DrawerPortalStub.displayName = 'DrawerPrimitive.Portal';

const DrawerCloseStub = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
  <button ref={ref} {...props} />
));
DrawerCloseStub.displayName = 'DrawerPrimitive.Close';

const DrawerOverlayStub = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} {...props} />
));
DrawerOverlayStub.displayName = 'DrawerPrimitive.Overlay';

const DrawerContentStub = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} {...props} />
));
DrawerContentStub.displayName = 'DrawerPrimitive.Content';

const DrawerHeaderStub = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} {...props} />
));
DrawerHeaderStub.displayName = 'DrawerPrimitive.Header';

const DrawerTitleStub = React.forwardRef<HTMLHeadingElement, any>((props, ref) => (
  <h2 ref={ref} {...props} />
));
DrawerTitleStub.displayName = 'DrawerPrimitive.Title';

const DrawerDescriptionStub = React.forwardRef<HTMLParagraphElement, any>((props, ref) => (
  <p ref={ref} {...props} />
));
DrawerDescriptionStub.displayName = 'DrawerPrimitive.Description';

const DrawerFooterStub = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <div ref={ref} {...props} />
));
DrawerFooterStub.displayName = 'DrawerPrimitive.Footer';

const DrawerPrimitive = {
  Root: DrawerRoot as DrawerPrimitiveRoot,
  Trigger: DrawerTriggerStub as DrawerPrimitiveTrigger,
  Portal: DrawerPortalStub as DrawerPrimitivePortal,
  Close: DrawerCloseStub as DrawerPrimitiveClose,
  Overlay: DrawerOverlayStub as DrawerPrimitiveOverlay,
  Content: DrawerContentStub as DrawerPrimitiveContent,
  Header: DrawerHeaderStub as DrawerPrimitiveHeader,
  Title: DrawerTitleStub as DrawerPrimitiveTitle,
  Description: DrawerDescriptionStub as DrawerPrimitiveDescription,
  Footer: DrawerFooterStub as DrawerPrimitiveFooter,
};

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
Drawer.displayName = 'Drawer';

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/80', className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName || 'DrawerOverlay';

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background',
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)}
    {...props}
  />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('mt-auto flex flex-col gap-2 p-4', className)}
    {...props}
  />
);
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName || 'DrawerTitle';

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DrawerDescription.displayName =
  DrawerPrimitive.Description.displayName || 'DrawerDescription';

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
