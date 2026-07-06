# Atelier Ink — Image Guide
## How to add your own photos

The site is already working with placeholder images from Unsplash.
To replace them with your own photos, just copy your files into the
right folder with the right name. The site will use your file automatically.

---

## Hero background
Folder: `/public/images/hero/`

| File name        | Where it appears              | Recommended size |
|------------------|-------------------------------|------------------|
| `studio-bg.jpg`  | Main hero background          | 1600×900px min   |
| `cta-bg.jpg`     | Bottom "Your story" section   | 1600×900px min   |

---

## Artist portraits
Folder: `/public/images/artists/`

| File name      | Artist          | Recommended size |
|----------------|-----------------|------------------|
| `adaeze.jpg`   | Adaeze Okonkwo  | 400×500px min    |
| `emeka.jpg`    | Emeka Nwosu     | 400×500px min    |
| `zainab.jpg`   | Zainab Bello    | 400×500px min    |

---

## Portfolio grid (8 photos)
Folder: `/public/images/portfolio/`

| File name  | Grid position | Tag            |
|------------|---------------|----------------|
| `1.jpg`    | Featured (big)| Fine Line      |
| `2.jpg`    | Normal        | Blackwork      |
| `3.jpg`    | Normal        | Afrocentric    |
| `4.jpg`    | Featured      | Neo-Traditional|
| `5.jpg`    | Normal        | Single Needle  |
| `6.jpg`    | Normal        | Geometric      |
| `7.jpg`    | Normal        | Piercing       |
| `8.jpg`    | Featured      | Blackwork      |

---

## Flash designs (booking wizard, Step 2)
Folder: `/public/images/portfolio/`

| File name     | Design name      |
|---------------|------------------|
| `flash-1.jpg` | Uli Vine         |
| `flash-2.jpg` | Adire Pattern    |
| `flash-3.jpg` | Nsibidi Script   |
| `flash-4.jpg` | Lagos Bloom      |
| `flash-5.jpg` | Kente Sleeve     |
| `flash-6.jpg` | Minimalist Ankh  |

---

## Tips
- JPG or PNG both work
- Keep file sizes under 2MB for fast loading
- Landscape images work best for the hero
- Portrait/square images work best for artist photos
- If a file is missing, the site automatically uses a placeholder — no errors

## To change names or add more artists
Edit the file: `src/lib/images.ts`
Everything is configured there in one place.
