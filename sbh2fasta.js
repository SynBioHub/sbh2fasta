
let request = require('request-promise')

let batch = 100
let offset = 0

main()

async function main() {

    for(;;) {

        process.stderr.write(offset + '\n')

        let endpoint = process.argv.slice(2).join(' ')

        let query = [
            'PREFIX sbol: <http://sbols.org/v2#>',
            'PREFIX dcterms: <http://purl.org/dc/terms/>',
            'SELECT ?cd ?sequence WHERE {',
            '?cd a sbol:ComponentDefinition .',
            '?cd sbol:sequence ?seq .',
            // OR
            // http://www.chem.qmul.ac.uk/iupac/AminoAcid/
            '?seq sbol:encoding <http://www.chem.qmul.ac.uk/iubmb/misc/naseq.html> .',
            '?seq sbol:elements ?sequence .',
            '}',
            'OFFSET ' + offset,
            'LIMIT ' + batch
        ].join('\n')


        var res

        try {
            res = await request({
                method: 'GET',
                url: endpoint,
                qs: {
                    query: query
                },
                headers: {
                    'Accept': 'application/json'
                }
            })
        } catch(e) {
            process.stderr.write(e)
            break
        }

        res = JSON.parse(res)

        if(res.results.bindings.length === 0) {
            process.stderr.write('done\n')
            break
        }

        res.results.bindings.forEach((binding) => {

            let header = binding.cd.value.split('/').slice(-4).join('__')

            process.stdout.write('> ' + header + '\n')
            process.stdout.write(binding.sequence.value + '\n')

        })

        offset += batch

    }

}


