# An overview of BibTeX entry types
See: [bibtex](bibtex.com/e/entry-types)

## Article
An article from a journal, magazine, newspaper, or periodical.

### Regular
A regular citation: [@Cohen-1963]

### Composite
A composite citation: [~@Cohen-1963]

### Suppress author
A citation with the author suppressed: [-@Cohen-1963]

### Author only
A citation with the author only: [!@Cohen-1963]


## Book
A book where the publisher is clearly identifiable.

### Regular
A regular citation: [@Susskind-Hrabovsky-2014]

### Composite
A composite citation: [~@Susskind-Hrabovsky-2014]

### Suppress author
A citation with the author suppressed: 
[-@Susskind-Hrabovsky-2014]

### Author only
A citation with the author only:
 [!@Susskind-Hrabovsky-2014]

## Booklet
A printed work that is bound, but does not have a clearly identifiable publisher or supporting institution.

### Regular
A regular citation: [@Swetla-2015]

### Composite
A composite citation: [~@Swetla-2015]

### Suppress author
A citation with the author suppressed: [-@Swetla-2015]

### Author only
A citation with the author only: [!@Swetla-2015]


## Inbook
A section, such as a chapter, or a page range within a book.

### Regular
A regular citation: [@Urry-etal-2016]

### Composite
A composite citation: [~@Urry-etal-2016]

### Suppress author
A citation with the author suppressed: [-@Urry-etal-2016]

### Author only
A citation with the author only: [!@Urry-etal-2016]


## Incollection
A titled section of a book. Such as a short story within the larger collection of short stories that make up the book.

### Regular
A regular citation: [@Shapiro-2018]

### Composite
A composite citation: [~@Shapiro-2018]

### Suppress author
A citation with the author suppressed: [-@Shapiro-2018]

### Author only
A citation with the author only: [!@Shapiro-2018]


## Inproceedings
A paper that has been published in conference proceedings. The usage of conference and inproceedings is the same.

### Regular
A regular citation: [@Holleis-Wagner-Koolwaaij-2010]

### Composite
A composite citation: [~@Holleis-Wagner-Koolwaaij-2010]

### Suppress author
A citation with the author suppressed: [-@Holleis-Wagner-Koolwaaij-2010]

### Author only
A citation with the author only: [!@Holleis-Wagner-Koolwaaij-2010]

## Manual
A technical manual for a machine software such as would come with a purchase to explain operation to the new owner.

### Regular
A regular citation: [@R-manual-2018]

### Composite
A composite citation: [~@R-manual-2018]

### Suppress author
A citation with the author suppressed: [-@R-manual-2018]

### Author only
A citation with the author only: [!@R-manual-2018]


## Master's thesis
A thesis written for the Master’s level degree.

### Regular
A regular citation: [@Tang-1996]

### Composite
A composite citation: [~@Tang-1996]

### Suppress author
A citation with the author suppressed: [-@Tang-1996]

### Author only
A citation with the author only: [!@Tang-1996]


## Misc
Used if none of the other entry types quite match the source. Frequently used to cite web pages, but can be anything from lecture slides to personal notes.

#### Regular
A regular citation: [@Pluto-2015]

### Composite
A composite citation: [~@Pluto-2015]

### Suppress author
A citation with the author suppressed: [-@Pluto-2015]

### Author only
A citation with the author only: [!@Pluto-2015]


## PHD thesis
A thesis written for the PhD level degree.

### Regular
A regular citation: [@Rempel-1956]

### Composite
A composite citation: [~@Rempel-1956]

### Suppress author
A citation with the author suppressed: [-@Rempel-1956]

### Author only
A citation with the author only: [!@Rempel-1956]


## Proceedings
A conference proceeding.

### Regular
A regular citation: [@Stepney-Verlan-2018]

### Composite
A composite citation: [~@Stepney-Verlan-2018]

### Suppress author
A citation with the author suppressed: [-@Stepney-Verlan-2018]

### Author only
A citation with the author only: [!@Stepney-Verlan-2018]


## Techreport
An institutionally published report such as 
a report from a school, a government organization, 
an organization, or a company. 
This entry type is also frequently 
used for white papers and working papers.

### Regular
A regular citation: [@Bennet-Bowman-Wright-2018]

### Composite
A composite citation: [~@Bennet-Bowman-Wright-2018]

### Suppress author
A citation with the author suppressed: [-@Bennet-Bowman-Wright-2018]

### Author only
A citation with the author only: [!@Bennet-Bowman-Wright-2018]


## Unpublished
A document that has not been officially published such as a paper draft or manuscript in preparation.

### Regular
A regular citation: [@Suresh-2006]

### Composite
A composite citation: [~@Suresh-2006]

### Suppress author
A citation with the author suppressed: [-@Suresh-2006]

### Author only
A citation with the author only: [!@Suresh-2006]


# Other features

## Prefixes
We can add a prefix to a citation, by wrapping it in curly braces: [@Rempel-1956{see}]


## Locators
We can append a locator to a citation by using a hashtag:
[@Pluto-2015#p. 3] 


## Combining locators and prefixes
These features can be combined:
[@R-manual-2018#ch.3{c.f.}]. 
We can even use different modes, such
as suppressing the author: [-@R-manual-2018#ch.3{c.f.}]. 

## Multiple references in a single citation
It is possible to reference multiple sources in a single
citation, by using a semicolon (`;`): 
[@Holleis-Wagner-Koolwaaij-2010; @Shapiro-2018].

## Modes, prefixes and multiple references
We can use a mode while referring to multiple sources,by
adding a mark before the first reference and we can use
a prefix per reference:
[~@Shapiro-2018{c.f.}; @Tang-1996{different:}#p. 3].

# Generate bibliography

[bibliography]