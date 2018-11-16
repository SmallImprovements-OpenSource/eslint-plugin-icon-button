# eslint-plugin-icon-button

Checker for accessibility of icon-buttons in JSX.

# Why?

It's sometimes easy to run an audit of your application to find all accessibility issues and fix them. The challenge then is maintaining this level of quality in the code without regularly telling developers that they should keep accessibility in mind. A common pattern when designing interfaces is to have buttons contain only icons (hence, "icon-button"). This hurts accessibility because screenreaders are not able to identify its meaning. The solution then is to provide an `aria-label` that accurately describes what the button is for.

# Usage

## Rule Details

This linter identifies components inside a `Button` that contain a substring `Icon` (case-sensitive). For example, [Small Improvements](https://www.small-improvements.com/)' internal icon library, [Featherico](https://github.com/SmallImprovements-OpenSource/featherico).

```
"rules": {
    "icon-button/icon-button": "1"
},

"plugins": [
    "icon-button"
]
```

## Succeed

```
<Button>hello world</Button>
<Button aria-label="an aria-label that describes something">
    <IconComponent />
</Button>
<Button>
    <IconComponent /> {expression}
</Button>
```

## Fail

```
<Button>
    <IconComponent/>
</Button>
<Button aria-label="">
    <IconComponent/>
</Button>
<Button aria-label="short label">
    <IconComponent/>
</Button>
```
