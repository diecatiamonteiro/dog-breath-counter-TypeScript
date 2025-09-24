# Button Component Usage Examples

## Navigation Buttons (Link-based)

```tsx
// Basic navigation button
<Button href="/my-dogs">My Dogs</Button>

// With icon on the left
<Button
  href="/my-dogs/add-dog"
  variant="secondary"
  icon={<MdAddCircleOutline className="w-5 h-5" />}
>
  Add Dog
</Button>

// With icon on the right
<Button
  href="/my-dogs"
  variant="ghost"
  size="sm"
  icon={<RiArrowLeftSLine className="w-6 h-6" />}
>
  Back
</Button>

// Hash link (smooth scroll + URL update)
<Button href="#features">See Features</Button>

// Navigation with click handler (e.g., to prevent event bubbling)
<Button
  href={`/my-dogs/${dog.id}`}
  variant="secondary"
  onClick={(e) => e.stopPropagation()}
>
  View Details
</Button>
```

## Action Buttons (Form/Submit)

```tsx
// Form submit button
<Button type="submit" variant="primary" size="lg">
  Save Dog
</Button>

// Submit with loading state
<Button
  type="submit"
  variant="primary"
  loading={isSubmitting}
  loadingText="Saving..."
>
  Save Dog
</Button>

// Delete action (danger variant)
<Button
  variant="danger"
  onClick={handleDelete}
  icon={<RiDeleteBin7Line className="w-4 h-4" />}
>
  Delete
</Button>

// Cancel button
<Button
  variant="ghost"
  onClick={onCancel}
>
  Cancel
</Button>
```

## Icon-only & Shapes

```tsx
// Delete squared icon-only button
<Button
  icon={<MdSearch />}
  iconOnly
  variant="secondary"
  shape="square"
  ariaLabel="Search"
/>

// Delete circular icon-only button
<Button
  icon={<MdClose />}
  iconOnly
  variant="dangerGhost"
  shape="circle"
  ariaLabel="Close"
/>
```

## Button Variants

- `primary` - Main action buttons (default)
- `secondary` - Secondary actions
- `ghost` - Subtle buttons, transparent background
- `danger` - Destructive actions (red background)
- `dangerGhost` - Destructive but subtle (red text, ghost style)

## Button Sizes

- `xs` - Extra small buttons (text-xs, compact padding)
- `sm` - Small buttons (text-sm, compact padding)
- `md` - Medium buttons (default)
- `lg` - Large buttons (text-lg, more padding)

## Props Reference

| Prop           | Type                                                               | Default     | Description                                          |
| -------------- | ------------------------------------------------------------------ | ----------- | ---------------------------------------------------- |
| `children`     | `ReactNode`                                                        | –           | Button text/content                                  |
| `href`         | `string`                                                           | –           | If provided, renders as a link (`<Link>` or `<a>`)   |
| `type`         | `"button" \| "submit" \| "reset"`                                  | `"button"`  | Type for `<button>` elements                         |
| `disabled`     | `boolean`                                                          | `false`     | Disable the button                                   |
| `onClick`      | `(e?: React.MouseEvent) => void`                                   | –           | Click handler                                        |
| `variant`      | `"primary" \| "secondary" \| "ghost" \| "danger" \| "dangerGhost"` | `"primary"` | Visual style                                         |
| `size`         | `"xs" \| "sm" \| "md" \| "lg"`                                     | `"md"`      | Button size                                          |
| `icon`         | `ReactNode`                                                        | –           | Icon element                                         |
| `iconPosition` | `"left" \| "right"`                                                | `"left"`    | Position of icon relative to text                    |
| `iconOnly`     | `boolean`                                                          | `false`     | Icon-only button, no text                            |
| `shape`        | `"default" \| "square" \| "circle"`                                | `"default"` | Shape of button                                      |
| `loading`      | `boolean`                                                          | `false`     | Show loading state                                   |
| `loadingText`  | `string`                                                           | –           | Text shown while loading                             |
| `ariaLabel`    | `string`                                                           | –           | Accessibility label (required for icon-only buttons) |
| `title`        | `string`                                                           | –           | Tooltip / title attribute                            |
| `className`    | `string`                                                           | –           | Custom CSS classes                                   |
