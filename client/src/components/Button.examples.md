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

// With icon on the right (back button style)
<Button 
  href="/my-dogs" 
  variant="ghost" 
  size="sm"
  icon={<RiArrowLeftSLine className="w-6 h-6" />}
>
  Back
</Button>

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
<Button type="submit" variant="primary" fullWidth>
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

## Button Variants
- `primary` - Main action buttons (default)
- `secondary` - Secondary actions, outlined style
- `ghost` - Subtle buttons, transparent background
- `danger` - Destructive actions (red)

## Button Sizes
- `sm` - Small buttons (text-sm, compact padding)
- `md` - Medium buttons (default)
- `lg` - Large buttons (text-lg, more padding)

## Props Reference
- `href?` - If provided, renders as Next.js Link
- `variant?` - Styling variant (primary | secondary | ghost | danger)
- `size?` - Button size (sm | md | lg)
- `icon?` - React element to display as icon
- `iconPosition?` - Icon placement (left | right)
- `loading?` - Shows spinner when true
- `loadingText?` - Text to show during loading
- `fullWidth?` - Makes button take full width
- `disabled?` - Disables the button
- `className?` - Additional CSS classes 